# SCENERY ROBOT V4 Firmware
# for UVA Stage Robotics Project
# Code Manager: Andy Carluccio - akclucc@gmail.com
# Programmers:
# Sai Raj
# Ayub Shahab

# Libraries
# roboclaw library left adjancent to this module
from Roboclaw.roboclaw_3 import Roboclaw
import select
import sys
import time
from geomdl import BSpline
import math
import numpy as np
import time
import configparser
from scipy import interpolate
import requests
import matplotlib.pyplot as plt
# address of the RoboClaw as set in Motion Studio
address = 128

# Creating the RoboClaw object, serial port and baudrate passed
roboclaw = Roboclaw("/dev/ttyAMA1", 115200)

# Starting communication with the RoboClaw hardware
roboclaw.Open()

# INITIALIZING GLOBALS FOR PURE PURSUIT
enc1 = 0
enc2 = 0

enc1_prev = 0
enc2_prev = 0

angle_prev = 0.0

config = configparser.ConfigParser()
config.read("config.ini")

TICKS_PER_INCH = float(config["MEASUREMENTS"]["TICKS_PER_INCH"])
TICKS_PER_REVOLUTION = float(config["MEASUREMENTS"]["TICKS_PER_REVOLUTION"])

ROBOT_WIDTH = float(config["MEASUREMENTS"]["ROBOT_WIDTH"])  # In Inches

# M2 IS RIGHT WHEEL, M1 IS LEFT WHEEL
t = 0
t_i = 0
LOOKAHEAD_DISTANCE = float(config["PURSUIT"]["LOOKAHEAD_DISTANCE"])
pos = [0.0, 0.0]

# VELOCITY/ACCEL CONSTANTS IN INCHES PER SECOND
MAX_VEL = float(config["PURSUIT"]["MAX_VEL"])
START_VEL = float(config["PURSUIT"]["START_VEL"])
TURN_CONST = float(config["PURSUIT"]["TURN_CONST"])
MAX_ACCEL = float(config["PURSUIT"]["MAX_ACCEL"])
MAX_VEL_CHANGE = float(config["PURSUIT"]["MAX_VEL_CHANGE"])

# ENCODER DATA FUNCTIONS------------------------------------------------------

# Returns the encoder data for a particular motor


def get_encoder_data(enc_id):
    if(enc_id == 1):
        return roboclaw.ReadEncM1(address)
    elif(enc_id == 2):
        return roboclaw.ReadEncM2(address)

# Generic function to stop the robot


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

    enc1 = get_encoder_data(1)[1]  # Left Wheel
    enc2 = get_encoder_data(2)[1]  # Right Wheel

# API communication section-----------------------------------------------------


def call_apis():
    print("calling /input endpoint")
    data = []
    # local host is an alias for 127.0.0.1
    # replace local host with whatever ip and it should work
    # give laptop a fixed ip address and hardcode it in? fixed ip of the website host 192.168.1.100
    # on the computer, spin a dns server, //robot.com ->
    while(len(data) == 0):  # loop until we get data from the /input endpoint
        data = requests.get("http://localhost:3000/input").json()
    print(data)
    print("calling /control endpoint")
    control = []
    control = requests.get("http://localhost:3000/control").json()
    print(control)
    return data, control


def call_data_input_api():
    print("calling /input endpoint")
    data = []
    while(len(data) == 0):  # loop until we get data from the /input endpoint
        data = requests.get("http://localhost:3000/input").json()
    print(data)
    return data


def call_control_api():
    print("calling /control endpoint")
    data = []
    while(len(data) == 0):  # loop until we get data from the /input endpoint
        data = requests.get("http://localhost:3000/control").json()
    print(data)
    return data

# PATH GENERATION FUNCTION-----------------------------------------------------


def path_generation():
    global MAX_VEL, START_VEL, TURN_CONST, MAX_ACCEL
    # PART 1: CALCULATE INITIAL SET OF POINTS FOR PATH
    # Set control points
    data, control = call_apis()
    # ctr = np.array([[0, 0], [5, -5], [10, 0], [15, 5],
    #                 [20, 0], [15, -5], [10, 0], [5, 5], [0, 0]])
    for i, w in enumerate(data):
        data[i][0] = float(data[i][0])
        data[i][1] = float(data[i][1])

    ctr = np.array(data)
    #ctr = np.array( [[0, 0], [12, 6], [24,-6], [36, 0]])
    x = ctr[:, 0]
    y = ctr[:, 1]

    tck, u = interpolate.splprep([x, y], k=3, s=0)
    u = np.linspace(0, 1, num=50, endpoint=True)
    out = interpolate.splev(u, tck)

    print(out)
    plt.figure()
    plt.plot(x, y, 'ro', out[0], out[1], 'b')
    plt.legend(['Points', 'Interpolated B-spline', 'True'], loc='best')
    plt.axis([min(x)-1, max(x)+1, min(y)-1, max(y)+1])
    plt.title('B-Spline interpolation')
    plt.show()
    path = []

    for i in range(len(out[0])):
        path.append([out[0][i], out[1][i]])

    for i, w in enumerate(path):
        if w[0] == path[i-1][0]:
            w[0] += 0.00001

    # PART 2: CALCULATE PATH DISTANCE FOR EACH POINT
    path[0].append(0)
    for i, w in enumerate(path[1:], start=1):
        w.append(path[i-1][2] + math.sqrt((w[0] - path[i-1][0])
                                          ** 2 + (w[1] - path[i-1][1])**2))

    # PART 3: CALCULATE CURVATURE AT EACH POINT
    path[0].append(0.0001)
    path[-1].append(0.0001)
    for i, w in enumerate(path[1:-1], start=1):
        w[0] += 0.0001
        w[1] += 0.0001
        k1 = .5*(w[0]**2 + w[1]**2 - path[i-1][0]**2 -
                 path[i-1][1]**2) / (w[0] - path[i-1][0])
        k2 = (w[1] - path[i-1][1]) / (w[0] - path[i-1][0])
        #print(str(w[0]) + ", " + str(path[i-1][0]))
        b = .5*(path[i-1][0]**2 - 2*path[i-1][0]*k1 + path[i-1][1]**2 - path[i+1][0]**2 + 2*path[i+1]
                [0]*k1 - path[i+1][1]**2) / (path[i+1][0]*k2 - path[i+1][1] + path[i-1][1] - path[i-1][0]*k2)
        a = k1 - k2*b
        r = math.sqrt((w[0]-a)**2 + (w[1]-b)**2)
        w.append(1/r)

    # PART 4: CALCULATE DESIRED VELOCITY AT EACH POINT
    for w in path:
        w.append(min(float(MAX_VEL), float(TURN_CONST/w[3])))

    # PART 5: ADD ACCELERATION LIMITS
    path[-1].append(0)
    for i, w in enumerate(reversed(path[:-1]), start=1):
        w.append(min(w[4], math.sqrt(path[-i][5]**2+(2*float(MAX_VEL)) *
                                     math.sqrt((w[0]-path[-i][0])**2 + (w[1]-path[-i][1])**2))))

    path[0][5] = float(START_VEL)
    for i, w in enumerate(path[1:], start=1):
        test = math.sqrt(path[i-1][5]**2 + (2*float(MAX_ACCEL)) *
                         math.sqrt((w[0] - path[i-1][0]) ** 2 + (w[1] - path[i-1][1]) ** 2))

        if test < w[5]:
            w[5] = test
        else:
            break

    final_path = []
    for i in path:
        final_path.append([i[1], i[0], i[5]])

    for i, w in enumerate(final_path):
        final_path[i][0] = final_path[i][0] * -1

    return final_path

# MAIN ODOMETRY FUNCTION---------------------------------------------------


def get_global_coord():
    global enc1
    global enc2
    global enc1_prev
    global enc2_prev
    global angle_prev
    global pos

    update_encoders()

    left_enc_change = enc1 - enc1_prev  # Change 0 to previously stored encoder data
    right_enc_change = enc2 - enc2_prev

    right_inches = right_enc_change / TICKS_PER_INCH
    left_inches = left_enc_change / TICKS_PER_INCH

    total_change = (left_inches + right_inches) / 2.0

    # length = 5.5 * TICKS_PER_INCH #This is the length of the robot in inches
    angle_prev += ((right_inches - left_inches) / ROBOT_WIDTH)

    # if(angle_prev >= 0):
    #    angle_prev = angle_prev % (math.pi * 2)
    # else:
    #    angle_prev =  angle_prev % -(math.pi * 2)

    # MATH.SIN AND MATH.COS ARE MADE TO TAKE IN A RADIAN VALUE
    # Change 0 to previously stored angle
    change_x = total_change * math.cos(angle_prev)
    change_y = total_change * math.sin(angle_prev)

    #angle_prev += change_angle
    pos = [pos[0]+change_x, pos[1]+change_y]
    return pos

# PURE PURSUIT FUNCTIONS----------------------------------------------------------


def closest(path):
    global pos
    mindist = (0, math.sqrt((path[0][0] - pos[0])
                            ** 2 + (path[0][1] - pos[1]) ** 2))

    for i, p in enumerate(path):
        dist = math.sqrt((p[0]-pos[0])**2 + (p[1]-pos[1])**2)
        if dist < mindist[1]:
            mindist = (i, dist)
    return mindist[0]


def lookahead(path):
    global t, t_i, LOOKAHEAD_DISTANCE, pos
    for i, p in enumerate(reversed(path[:-1])):
        i_ = len(path) - 2 - i
        d = (path[i_+1][0]-p[0], path[i_+1][1]-p[1])
        f = (p[0]-pos[0], p[1]-pos[1])

        a = sum(j**2 for j in d)
        b = 2*sum(j*k for j, k in zip(d, f))
        c = sum(j**2 for j in f) - float(LOOKAHEAD_DISTANCE**2)
        disc = b**2 - 4*a*c
        if disc >= 0:
            disc = math.sqrt(disc)
            t1 = (-b + disc)/(2*a)
            t2 = (-b - disc)/(2*a)
            if 0 <= t1 <= 1:
                if((i_ - t_i) < 3):
                    t = t1
                    t_i = i_
                    # print(i_)
                    return p[0]+t*d[0], p[1]+t*d[1]
            if 0 <= t2 <= 1:
                if((i_ - t_i) < 3):
                    t = t2
                    t_i = i_
                    # print(i_)
                    return p[0]+t*d[0], p[1]+t*d[1]
    t = 0
    t_i = 0
    return path[closest(path)][0:2]

# Code taken from https://github.com/arimb/PurePursuit/blob/master/RobotSimulator.py


def curvature(lookahead):
    global angle_prev, pos
    side = np.sign(math.sin(
        angle_prev)*(lookahead[0]-pos[0]) - math.cos(angle_prev)*(lookahead[1]-pos[1]))
    a = -math.tan(angle_prev)
    c = math.tan(angle_prev)*pos[0] - pos[1]
    x = abs(a*lookahead[0] + lookahead[1] + c) / math.sqrt(a**2 + 1)
    return side * (2*x/(float(LOOKAHEAD_DISTANCE)**2))


def turn(curv, vel):
    return [vel*(2+(curv*ROBOT_WIDTH))/2, vel*(2-(curv*ROBOT_WIDTH))/2]

# TESTING FUNCTIONS---------------------------------------------------------------


def mini_curve():
    roboclaw.SpeedM1(address, 500)
    roboclaw.SpeedM2(address, 600)
    while(get_global_coord()[0] < 26.0):
        my_pos = get_global_coord()
    print(my_pos)
    stop()


def speed_test():
    while(get_global_coord()[0] < 6.0):
        roboclaw.SpeedM1(address, 1130)
        roboclaw.SpeedM2(address, 1130)
        get_global_coord()
    while(get_global_coord()[0] < 12.0 and get_global_coord()[0] >= 6.0):
        roboclaw.SpeedM1(address, 600)
        roboclaw.SpeedM2(address, 600)
        get_global_coord
    stop()


def test_follow():
    global enc1, enc2, enc1_prev, enc2_prev, t_i, pos, angle_prev
    path = path_generation()
    angle_prev = math.pi/2

    wheels = [0.0, 0.0]
    close = 0
    global_close = 0
    count = 0
    while(global_close < len(path)-1 or count < 5):
        if (close+10 > len(path)):
            cut_path = path[close: len(path)]
        else:
            cut_path = path[close: close + 10]
        close = closest(cut_path)
        global_close = closest(path)

        print(pos)

        look = lookahead(path)
        curv = curvature(look) if t_i > global_close else 0.00001
        vel = cut_path[close][2]

        last_wheels = wheels
        wheels = turn(curv, vel)

        for i, w in enumerate(wheels):
            wheels[i] = last_wheels[i] + \
                min(float(MAX_VEL_CHANGE),
                    max(-float(MAX_VEL_CHANGE), w - last_wheels[i]))

        roboclaw.SpeedM1(address, int(wheels[0] * TICKS_PER_INCH))
        roboclaw.SpeedM2(address, int(wheels[1] * TICKS_PER_INCH))

        get_global_coord()
        count += 1

    print(cut_path)
    stop()
    roboclaw.SetEncM1(address, 0)
    roboclaw.SetEncM2(address, 0)

# MAIN LOOP---------------------------------------------


while(True):
    # For the sake of demo, a simple text-based control system:
    # call_apis()
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
    if (words[0] == "reverse"):
        if(words[1] == "1"):
            print("going reverse")
            speed = int(words[2])
            roboclaw.BackwardM1(address, speed)
        elif(words[1] == "2"):
            speed = int(words[2])
            roboclaw.BackwardM2(address, speed)
        elif(words[1] == "all"):
            speed = int(words[2])
            roboclaw.BackwardM2(address, speed)
            roboclaw.BackwardM1(address, speed)
    elif(words[0] == "stop"):
        stop()
    elif(words[0] == "enc"):
        print(get_encoder_data(1))
        print(get_encoder_data(2))
    elif(words[0] == "clear"):
        roboclaw.SetEncM1(address, 0)
        roboclaw.SetEncM2(address, 0)
    elif(words[0] == "mini"):
        mini_curve()
    elif(words[0] == "test"):
        test_follow()
    elif(words[0] == "speed"):
        speed_test()
    elif(words[0] == "path"):
        path_generation()
