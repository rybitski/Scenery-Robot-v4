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

# address of the RoboClaw as set in Motion Studio
address = 128

# Creating the RoboClaw object, serial port and baudrate passed
roboclaw = Roboclaw("/dev/ttyS0", 115200)

# Starting communication with the RoboClaw hardware
roboclaw.Open()

MAX_DELTA = 50 #the maximum power 

STEP_1 = 10
STEP_2 = 20
STEP_3 = 30

enc1 = 0
enc2 = 0

enc1_prev = 0
enc2_prev = 0

angle_prev = 0.0
pure_angle = 0.0
#90*math.pi/180

TICKS_PER_INCH = 188.46
TICKS_PER_REVOLUTION = 1490.0

ROBOT_WIDTH = 7.0625 #In Inches

prev_coord = [0,0]

#M2 IS RIGHT WHEEL, M1 IS LEFT WHEEL

t = 0
t_i = 0
LOOKAHEAD_DISTANCE = 0.5
pos = [0.0,0.0]

#VELOCITY/ACCEL CONSTANTS IN INCHES PER SECOND
MAX_VEL = 10
START_VEL = 4
TURN_CONST = 4
MAX_ACCEL = 2
MAX_VEL_CHANGE = 6

#FUNCTIONS------------------------------------------------------

#Get cues from the server and save them to local memory
def pull_cues():
    return 1

#Takes movement parameters and calls on Roboclaw to complete
def drive(args):
    return 1

#Returns the encoder data for a particular motor
def get_encoder_data(enc_id):
    if(enc_id == 1):
        return roboclaw.ReadEncM1(address)
    elif(enc_id == 2):
        return roboclaw.ReadEncM2(address)

#Publish data to the server
def publish_data(page, data):
    return 1

#Generic function to stop the robot
def stop():
    roboclaw.ForwardM1(address, 0)
    roboclaw.ForwardM2(address, 0)

#Activate the current cue on deck, advance the rest, update previous, etc.
def go():
    return 1

#Trigger homing system to remove accumulated error (hardware support pending)
def home():
    return 1

#Reads an input file and sets up a server with ip information, etc.
def config_server(input_file):
    return 1

#Sets a particular SPI pin HIGH or LOW for external devices
def pin_mode(pin, val):
    return 1

def update_encoders():
    global enc1
    global enc2
    global enc1_prev
    global enc2_prev
    
    enc1_prev = enc1
    enc2_prev = enc2

    enc1 = get_encoder_data(1)[1] #Left Wheel
    enc2 = get_encoder_data(2)[1] #Right Wheel

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

    #left_inches = 2.0 * math.pi * 2.75 *  (left_enc_change/ 1485.0)
    #right_inches= 2.0 * math.pi * 2.75 * (right_enc_change/ 1485.0)

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
    #pos = prev_coord
    return prev_coord

def get_power_set(err_theta,err_dist):
    global enc1
    global enc2
    global enc1_prev
    global enc2_prev

    #We don't really need this, but it could be helpful in the future
    #focus_point = circ_swing(math.radians(err_theta),err_dist)

    power_offsets = [0,0] #move straight ahead

    if(err_theta<=30 and err_theta >= 0):
        power_offsets = [STEP_3,0]
        print("0-30 case here")
    elif(err_theta<=60 and err_theta >= 30):
        power_offsets = [STEP_2,0]
        print("30-60 case here")
    elif(err_theta<=80 and err_theta >= 60):
        power_offsets = [STEP_1,0]
        print("80-80 case here")
    
    elif(err_theta<=100 and err_theta>=80):
        power_offsets = [0,0]
        print("80-100 case here")

    elif(err_theta<=120 and err_theta >= 100):
        power_offsets = [0,STEP_1]
        print("100-120 case here")
    elif(err_theta<=150 and err_theta >= 120):
        power_offsets = [0,STEP_2]
        print("120-150 case here")
    elif(err_theta<=180 and err_theta >= 150):
        power_offsets = [0,STEP_3]
        print("150-180 case here")

    return power_offsets

#This is where we are testing the NURB follow ability
def curve_test():
    global enc1
    global enc2
    global enc1_prev
    global enc2_prev
    global angle_prev

    print("Running curve test...")
    # Create the curve instance
    crv = BSpline.Curve()
    # Set degree
    crv.degree = 3
    # Set control points
    crv.ctrlpts = [[0, 0], [3, 7], [5,1], [9,9]]
    # Set knot vector
    crv.knotvector = [0, 0, 0, 0, 1, 1, 1, 1]
    
    # Get curve points
    points = crv.evalpts

    #assign every 10th pt to a list, as well as start and finish
    focus_pts = []
    #focus_pts.append(points[0])
    k=0
    for pt in points:
        if((k % 11) == 0):
            focus_pts.append([pt[0]*TICKS_PER_INCH,pt[1]*TICKS_PER_INCH])
        k += 1
            #print(pt)
    last = points[len(points)-1]
    focus_pts.append([last[0]*TICKS_PER_INCH,last[1]*TICKS_PER_INCH])

    #my_pos should be fed by encoder readings, not by speculation of success
    my_pos = get_global_coord()

    for pt in focus_pts:
        print("Target point is: ")
        print()
        print(pt)
        print("My X Position Is: " +  str(my_pos[0]))
        print("My Y Position Is: " + str(my_pos[1]))
        while(abs(pt[0] - my_pos[0]) >100 and abs(pt[1] - my_pos[1])>100): #add some margin check?
           
            gamma = math.atan2((pt[1]-my_pos[1]) , (pt[0]-my_pos[0]))
            gamma = gamma*180 / math.pi

            e_theta = 90 + gamma - (angle_prev*180 / math.pi) 
            
            #print("e_theta")
            #print(e_theta)

            #print("position")
            #print(my_pos)

            e_dist = math.sqrt((pt[0]-my_pos[0])**2 + (pt[1]-my_pos[1])**2)

            #Now do the acceleration thing...
            base_power_set = [15, 15]#or fake it in my case
            power_offsets = get_power_set((e_theta),e_dist)
            power_command = [base_power_set[0]+power_offsets[0], base_power_set[1]+power_offsets[1]]

            #update my_pos
            my_pos = get_global_coord()
            roboclaw.ForwardM2(address, power_command[0])
            roboclaw.ForwardM1(address, power_command[1]) 

    stop()
    return 1


roboclaw.SetEncM1(address, 0)
roboclaw.SetEncM2(address, 0)

full_rotation = 4218*2

def get_spline():
    print("Running curve test...")
    # Create the curve instance
    crv = BSpline.Curve()
    # Set degree
    crv.degree = 3
    # Set control points
    crv.ctrlpts = [[0, 0], [3, 7], [5,1], [9,9]]
    # Set knot vector
    crv.knotvector = [0, 0, 0, 0, 1, 1, 1, 1]   
    # Get curve points
    points = crv.evalpts

    print(points)

def mini_curve():
    roboclaw.SpeedM1(address, 500)
    roboclaw.SpeedM2(address,600)
    while(get_global_coord()[0] < 12.0):
        my_pos = get_global_coord()
        print(my_pos)
    stop()

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


def speed_test():
    roboclaw.SpeedM1(address, 1130)
    roboclaw.SpeedM2(address, 1200)
    time.sleep(1)
    stop()

def test_follow():
    global enc1
    global enc2
    global enc1_prev
    global enc2_prev
    global t_i, pos
    global angle_prev
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
    elif(words[0] == "cue"):
        if(words[1] == "all"):
             roboclaw.SpeedAccelDeccelPositionM1(address,int(words[2]),int(words[3]),int(words[4]),int(words[5]),int(words[6]))
             roboclaw.SpeedAccelDeccelPositionM2(address,int(words[2]),int(words[3]),int(words[4]),int(words[5]),int(words[6]))
        elif(words[1] == "1"):
            roboclaw.SpeedAccelDeccelPositionM1(address,int(words[2]),int(words[3]),int(words[4]),int(words[5]),int(words[6]))
        elif(words[1] == "2"):
            roboclaw.SpeedAccelDeccelPositionM2(address,int(words[2]),int(words[3]),int(words[4]),int(words[5]),int(words[6]))
    elif(words[0] == "enc"):
        print(get_encoder_data(1))
        print(get_encoder_data(2))
    elif(words[0] == "clear"):
        roboclaw.SetEncM1(address, 0)
        roboclaw.SetEncM2(address, 0)
    elif(words[0] == "inc"):
        roboclaw.ForwardM1(address, 50) 
        time.sleep(0.1)
        roboclaw.ForwardM1(address, 0) 
    elif(words[0] == "spin1"):
        roboclaw.SpeedAccelDeccelPositionM1(address,300,500,200,int(full_rotation),1)
    elif(words[0] == "spin2"):
        roboclaw.SpeedAccelDeccelPositionM1(address,300,500,200,int(full_rotation / 2.0),1)
        roboclaw.SpeedAccelDeccelPositionM2(address,300,500,200,int(full_rotation / -2.0),1)
    elif(words[0] == "curve"):
        curve_test()
    elif(words[0] == "spline"):
        get_spline()
    elif(words[0] == "mini"):
        mini_curve()
    elif(words[0] == "test"):
        test_follow()
    elif(words[0] == "speed"):
        speed_test()
    elif(words[0] == "path"):
        path_generation()
    




