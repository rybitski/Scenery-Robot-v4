# Complete example of using the RoboClaw library
#import the relevant code from the RoboClaw library

from roboclaw import Roboclaw

# address of the RoboClaw as set in Motion Studio

address = 128

# Creating the RoboClaw object, serial port and baudrate passed

roboclaw = Roboclaw("/dev/ttyS0", 115200)

# Starting communication with the RoboClaw hardware

roboclaw.Open()

# Start motor 1 in the forward direction at half speed

roboclaw.ForwardM1(address, 0)
roboclaw.ForwardM2(address, 0)


