#SCENERY ROBOT V4 Firmware
#for UVA Stage Robotics Project
#Code Manager: Andy Carluccio - akclucc@gmail.com
#Programmers:
#Sai Raj

#Libraries
from Roboclaw.roboclaw import Roboclaw #roboclaw library left adjancent to this module
import select
import sys
import time
from geomdl import BSpline
import math

# address of the RoboClaw as set in Motion Studio
address = 128

# Creating the RoboClaw object, serial port and baudrate passed
roboclaw = Roboclaw("/dev/ttyS0", 115200)

# Starting communication with the RoboClaw hardware
roboclaw.Open()

MAX_DELTA = 50 #the maximum power 

STEP_1 = 100
STEP_2 = 300
STEP_3 = 500

current_left_encoder = 0
current_right_encoder = 0
current_angle = 0

#FUNCTIONS------------------------------------------------------

#Get cues from the server and save them to local memory
def pull_cues():
    return 1

#Takes movement parameters and calls on Roboclaw to complete
def drive(args):
    return 1

#Returns the encoder data for a particular motor
def get_encoder_data(enc_id):
    if(enc_id == 1): #left wheel
        return roboclaw.ReadEncM1(address)
    elif(enc_id == 2): #right wheel
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

def get_global_coord():
    enc1 = get_encoder_data(1) #Left Wheel
    enc2 = get_encoder_data(2) #Right Wheel

    left_change = enc1 - current_left_encoder #Change 0 to previously stored encoder data
    right_change = enc2 - current_right_encoder

    total_change = left_change + right_change /2
    length = 5.5 #This is the length of the robot in inches
    change_angle = (right_change - left_change) / length

    change_x = total_change * math.cos(current_angle + change_angle/2) #Change 0 to previously stored angle
    change_y = total_change * math.sin(current_angle + change_angle/2)

    return[change_x, change_y]

def get_power_set(err_theta,err_dist):
    #We don't really need this, but it could be helpful in the future
    #focus_point = circ_swing(math.radians(err_theta),err_dist)

    power_offsets = [0,0] #move straight ahead

    if(err_theta<=30 and err_theta >= 0):
        power_offsets = [STEP_3,0]
    elif(err_theta<=60 and err_theta >= 30):
        power_offsets = [STEP_2,0]
    elif(err_theta<=80 and err_theta >= 60):
        power_offsets = [STEP_1,0]
    
    elif(err_theta<=100 and err_theta>=80):
        power_offsets = [0,0]

    elif(err_theta<=120 and err_theta >= 90):
        power_offsets = [0,STEP_1]
    elif(err_theta<=150 and err_theta >= 120):
        power_offsets = [0,STEP_2]
    elif(err_theta<=180 and err_theta >= 150):
        power_offsets = [0,STEP_3]

    return power_offsets

#This is where we are testing the NURB follow ability
def curve_test():
    print("Running curve test...")
    # Create the curve instance
    crv = BSpline.Curve()
    # Set degree
    crv.degree = 1
    # Set control points
    crv.ctrlpts = [[0, 0], [1, 1]]
    # Set knot vector
    crv.knotvector = [0, 0, 1, 1]
    
    # Get curve points
    points = crv.evalpts

    #assign every 10th pt to a list, as well as start and finish
    focus_pts = []
    focus_pts.append(points[0])
    k=0
    for pt in points:
        if((k % 10) == 0):
            focus_pts.append(pt)
            #print(pt)
    focus_pts.append(points[len(points)-1])

    print(focus_pts)

    #my_pos should be fed by encoder readings, not by speculation of success
    my_pos = focus_pts[0]
    theta = 0

    for pt in focus_points:
        if(pt != my_pos):
            gamma = math.atan2((pt[1]-my_pos[1]) / (pt[0]-my_pos[0]))
            e_theta = theta-gamma
            e_dist = math.sqrt((pt[0]-my_pos[0])**2 + (pt[1]-my_pos[1])**2)

            #Now do the acceleration thing...
            base_power_set = [50,50] #or fake it in my case
            power_offsets = get_power_set(e_theta,e_dist)
            power_command = [base_power_set[0]+power_offsets[0], base_power_set[1]+power_offsets[1]]

            #roboclaw.ForwardM2(address, power_command[0])
            #roboclaw.ForwardM1(address, power_command[1]) 

    return 1


roboclaw.SetEncM1(address, 0)
roboclaw.SetEncM2(address, 0)

full_rotation = 4218*2

#Execution loop
while(True):
    #For the sake of demo, a simple text-based control system:
    var = raw_input("Please Enter a drive command: ")
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
        

    #else:
        #print ("No data")

    




