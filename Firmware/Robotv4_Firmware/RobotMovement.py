#SCENERY ROBOT V4 Firmware
#for UVA Stage Robotics Project
#Code Manager: Andy Carluccio - akclucc@gmail.com
#Programmers:
#Sai Raj

#Libraries
from Roboclaw.roboclaw_3 import Roboclaw #roboclaw library left adjancent to this module
import select
import sys
import time
from geomdl import BSpline
import math
import numpy as np
import time
import configparser

# address of the RoboClaw as set in Motion Studio
address = 128

# Creating the RoboClaw object, serial port and baudrate passed
roboclaw = Roboclaw("/dev/ttyAMA1", 115200)

# Starting communication with the RoboClaw hardware
roboclaw.Open()

#INITIALIZING GLOBALS FOR PURE PURSUIT
enc1 = 0
enc2 = 0

enc1_prev = 0
enc2_prev = 0

angle_prev = 0.0
pure_angle = 0.0

config = configparser.ConfigParser()
config.read("config.ini")

TICKS_PER_INCH = float(config["MEASUREMENTS"]["TICKS_PER_INCH"])
TICKS_PER_REVOLUTION = float(config["MEASUREMENTS"]["TICKS_PER_REVOLUTION"])

ROBOT_WIDTH = float(config["MEASUREMENTS"]["ROBOT_WIDTH"]) #In Inches

prev_coord = [0,0]

#M2 IS RIGHT WHEEL, M1 IS LEFT WHEEL
t = 0
t_i = 0
LOOKAHEAD_DISTANCE = float(config["PURSUIT"]["LOOKAHEAD_DISTANCE"])
pos = [0.0,0.0]

#VELOCITY/ACCEL CONSTANTS IN INCHES PER SECOND
MAX_VEL = float(config["PURSUIT"]["MAX_VEL"])
START_VEL = float(config["PURSUIT"]["START_VEL"])
TURN_CONST = float(config["PURSUIT"]["TURN_CONST"])
MAX_ACCEL = float(config["PURSUIT"]["MAX_ACCEL"])
MAX_VEL_CHANGE = float(config["PURSUIT"]["MAX_VEL_CHANGE"])

#ENCODER DATA FUNCTIONS------------------------------------------------------

#Returns the encoder data for a particular motor
def get_encoder_data(enc_id):
    if(enc_id == 1):
        return roboclaw.ReadEncM1(address)
    elif(enc_id == 2):
        return roboclaw.ReadEncM2(address)

#Generic function to stop the robot
def stop():
    roboclaw.ForwardM1(address, 0)
    roboclaw.ForwardM2(address, 0)

def update_encoders():
    global enc1
    global enc2
    global enc1_prev
    global enc2_prev
    
    enc1_prev = enc1
    enc2_prev = enc2

    enc1 = get_encoder_data(1)[1] #Left Wheel
    enc2 = get_encoder_data(2)[1] #Right Wheel

#PATH GENERATION FUNCTION-----------------------------------------------------

def path_generation():
    global MAX_VEL, START_VEL, TURN_CONST, MAX_ACCEL
    #PART 1: CALCULATE INITIAL SET OF POINTS FOR PATH
    crv = BSpline.Curve()
    # Set degree
    crv.degree = 3
    # Set control points
    crv.ctrlpts = [[0, 0], [12, 6], [24,-6], [36,6]]
    # Set knot vector
    crv.knotvector = [0, 0, 0, 0, 1, 1, 1, 1]   
    # Get curve points
    path = crv.evalpts

    #PART 2: CALCULATE PATH DISTANCE FOR EACH POINT 
    path[0].append(0)
    for i, w in enumerate(path[1:], start=1):
        w.append(path[i-1][2] + math.sqrt((w[0] - path[i-1][0])**2 + (w[1] - path[i-1][1])**2))
    
    #PART 3: CALCULATE CURVATURE AT EACH POINT
    path[0].append(0.0001)
    path[-1].append(0.0001)
    for i, w in enumerate(path[1:-1], start=1):
        w[0] += 0.0001
        w[1] += 0.0001
        k1 = .5*(w[0]**2 + w[1]**2 - path[i-1][0]**2 - path[i-1][1]**2) / (w[0] - path[i-1][0])
        k2 = (w[1] - path[i-1][1]) / (w[0] - path[i-1][0])
        b = .5*(path[i-1][0]**2 - 2*path[i-1][0]*k1 + path[i-1][1]**2 - path[i+1][0]**2 + 2*path[i+1][0]*k1 - path[i+1][1]**2) / (path[i+1][0]*k2 - path[i+1][1] + path[i-1][1] - path[i-1][0]*k2)
        a = k1 - k2*b
        r = math.sqrt((w[0]-a)**2 + (w[1]-b)**2)
        w.append(1/r)
    
    #PART 4: CALCULATE DESIRED VELOCITY AT EACH POINT
    for w in path:
        w.append(min(float(MAX_VEL), float(TURN_CONST/w[3])))


    #PART 5: ADD ACCELERATION LIMITS
    path[-1].append(0)
    for i, w in enumerate(reversed(path[:-1]), start=1):
        w.append(min(w[4], math.sqrt(path[-i][5]**2+(2*float(MAX_VEL))* \
                                  math.sqrt((w[0]-path[-i][0])**2 + (w[1]-path[-i][1])**2))))

    path[0][5] = float(START_VEL)
    for i, w in enumerate(path[1:], start=1):
        test = math.sqrt(path[i-1][5]**2 + (2*float(MAX_ACCEL))* \
                        math.sqrt((w[0] - path[i-1][0]) ** 2 + (w[1] - path[i-1][1]) ** 2))
    
        if test < w[5]:
            w[5] = test
        else:
            break
    final_path = []
    for i in path:
        final_path.append([i[0], i[1], i[5]])
    
    return final_path

#MAIN ODOMETRY FUNCTION---------------------------------------------------

def get_global_coord():
    global enc1
    global enc2
    global enc1_prev
    global enc2_prev
    global angle_prev
    global prev_coord

    update_encoders()

    left_enc_change = enc1 - enc1_prev #Change 0 to previously stored encoder data
    right_enc_change = enc2 - enc2_prev

    right_inches = right_enc_change / TICKS_PER_INCH
    left_inches = left_enc_change/ TICKS_PER_INCH

    total_change = (left_inches + right_inches) /2.0

    #length = 5.5 * TICKS_PER_INCH #This is the length of the robot in inches
    angle_prev += ((right_inches - left_inches) / ROBOT_WIDTH)

    if(angle_prev >= 0):
        angle_prev = angle_prev % (math.pi * 2)
    else:
        angle_prev =  angle_prev % -(math.pi * 2) 

    #MATH.SIN AND MATH.COS ARE MADE TO TAKE IN A RADIAN VALUE
    change_x = total_change * math.cos(angle_prev) #Change 0 to previously stored angle
    change_y =  total_change * math.sin(angle_prev)
    
    #angle_prev += change_angle
    prev_coord = [prev_coord[0]+change_x,prev_coord[1]+change_y]
    return prev_coord

#PURE PURSUIT FUNCTIONS----------------------------------------------------------

#Finds the closest coordinate in the path
def closest(path):
    global pos
    mindist = (0, math.sqrt((path[0][0] - pos[0]) ** 2 + (path[0][1] - pos[1]) ** 2))

    for i, p in enumerate(path):
        dist = math.sqrt((p[0]-pos[0])**2 + (p[1]-pos[1])**2)
        if dist < mindist[1]:
            mindist = (i, dist)
    return mindist[0]

#Code taken from https://github.com/arimb/PurePursuit/blob/master/RobotSimulator.py
def lookahead(path):
    global t, t_i, LOOKAHEAD_DISTANCE, pos
    for i, p in enumerate(reversed(path[:-1])):
        i_ = len(path) -2 -i
        d = (path[i_+1][0]-p[0], path[i_+1][1]-p[1])
        f = (p[0]-pos[0], p[1]-pos[1])

        a = sum(j**2 for j in d)
        b = 2*sum(j*k for j,k in zip(d,f))
        c = sum(j**2 for j in f) - LOOKAHEAD_DISTANCE**2
        disc = b**2 - 4*a*c
        if disc >= 0:
            disc = math.sqrt(disc)
            t1 = (-b + disc)/(2*a)
            t2 = (-b - disc)/(2*a)
            if 0<=t1<=1:
                t = t1
                t_i = i_
                return p[0]+t*d[0], p[1]+t*d[1]
            if 0<=t2<=1:
                t = t2
                t_i = i_
                return p[0]+t*d[0], p[1]+t*d[1]
    t = 0
    t_i = 0
    return path[closest(path)][0:2]

#Code taken from https://github.com/arimb/PurePursuit/blob/master/RobotSimulator.py
def curvature(lookahead, path):
    global pure_angle, pos
    side = np.sign(math.sin(3.1415/2 - pure_angle)*(lookahead[0]-pos[0]) - math.cos(3.1415/2 - pure_angle)*(lookahead[1]-pos[1]))
    a = -math.tan(3.1415/2 - pure_angle)
    c = math.tan(3.1415/2 - pure_angle)*pos[0] - pos[1]
    x = abs(a*lookahead[0] + lookahead[1] + c) / math.sqrt(a**2 + 1)
    return side * (2*x/(float(LOOKAHEAD_DISTANCE)**2))

def turn(curv, vel):
    return [(vel*(2+(curv*ROBOT_WIDTH))/2) , (vel*(2-(curv*ROBOT_WIDTH))/2)]

#TESTING FUNCTIONS---------------------------------------------------------------
def mini_curve():
    roboclaw.SpeedM1(address, 500)
    roboclaw.SpeedM2(address,600)
    while(get_global_coord()[0] < 12.0):
        my_pos = get_global_coord()
        print(my_pos)
    stop()

def speed_test():
    roboclaw.SpeedM1(address, 1130)
    roboclaw.SpeedM2(address, 1200)
    time.sleep(1)
    stop()

def test_follow():
    global enc1, enc2, enc1_prev, enc2_prev, t_i, pos, angle_prev
    #pure_angle
    path = path_generation()
    angle_prev = math.atan2(path[1][0], path[1][1])
    wheels = [0.0, 0.0]
    #dt = 0.007

    print(path)

    while(pos[0] < 12.0):
        look = lookahead(path)
        close = closest(path)
        curv = curvature(look, path) if t_i > close else 0.00001
        vel = path[close][2]
        last_wheels = wheels
        wheels = turn(curv, vel)

        for i, w in enumerate(wheels):
            wheels[i] = last_wheels[i] + min(float(MAX_VEL_CHANGE) * dt, max(-float(MAX_VEL_CHANGE) * dt, w - last_wheels[i]))
        
        roboclaw.SpeedM1(address, int(wheels[0] * TICKS_PER_INCH))
        roboclaw.SpeedM2(address, int(wheels[1] * TICKS_PER_INCH))
    
        #enc1_prev = enc1
        #enc2_prev = enc2
        #enc1 = get_encoder_data(1)[1] #Left Wheel
        #enc2 = get_encoder_data(2)[1]
        #left_enc_change = enc1 - enc1_prev #Change 0 to previously stored encoder data
        #right_enc_change = enc2 - enc2_prev
        #right_inches = right_enc_change / TICKS_PER_INCH
        #left_inches = left_enc_change/ TICKS_PER_INCH
        #pos = (pos[0] + (right_inches+ left_inches)/2 * math.sin(pure_angle), pos[1] + (right_inches + left_inches)/2 * math.cos(pure_angle))
        #pure_angle += math.atan((wheels[0] - wheels[1])/ROBOT_WIDTH * dt)
        print("Position:", pos)
    stop()

#MAIN LOOP---------------------------------------------

while(True):
    #For the sake of demo, a simple text-based control system:
    var = input("Please Enter a drive command: ")
    print("You entered", var)
    words = var.split()
    print(words)
    if (words[0] == "forward"):
        if(words[1] == "1"):
            print("going forward")
            speed = int(words[2])
            roboclaw.ForwardM1(address, speed)
        elif(words[1] == "2"):
            speed = int(words[2])
            roboclaw.ForwardM2(address, speed)
        elif(words[1] == "all"):
            speed = int(words[2])
            roboclaw.ForwardM2(address, speed)
            roboclaw.ForwardM1(address, speed)          
    elif(words[0] == "stop"):
        stop()
    elif(words[0] == "enc"):
        print(get_encoder_data(1))
        print(get_encoder_data(2))
    elif(words[0] == "clear"):
        roboclaw.SetEncM1(address, 0)
        roboclaw.SetEncM2(address, 0)
    elif(words[0] == "curve"):
        curve_test()
    elif(words[0] == "mini"):
        mini_curve()
    elif(words[0] == "test"):
        test_follow()
    elif(words[0] == "speed"):
        speed_test()
    elif(words[0] == "path"):
        path_generation()