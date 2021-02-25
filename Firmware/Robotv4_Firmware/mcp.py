#Example code from Adafruit and modified be Chris Rybitski 9/9/2020
#This tests the functionality of the MCP23008 port expander. The port expander
#is connected to an onboard RGB LED and then broken out to the screw terminals
#labled "MCP3" through "MCP7". These labels coorespond with the pins in the library.
#The LED is common cathode which results in it being off when the output is set to true.

import time
import board
import busio
import digitalio
from adafruit_mcp230xx.mcp23008 import MCP23008
 
# Initialize the I2C bus:
i2c = busio.I2C(board.SCL, board.SDA)
 
# address of the device
mcp = MCP23008(i2c, address=0x20)  # MCP23008
 
# Now call the get_pin function to get an instance of a pin on the chip.
# This instance will act just like a digitalio.DigitalInOut class instance
# and has all the same properties and methods (except you can't set pull-down
# resistors, only pull-up!).  For the MCP23008 you specify a pin number from 0
# to 7 for the GP0...GP7 pins.  For the MCP23017 you specify a pin number from
# 0 to 15 for the GPIOA0...GPIOA7, GPIOB0...GPIOB7 pins (i.e. pin 12 is GPIOB4).
pin0 = mcp.get_pin(0)	#blue
pin1 = mcp.get_pin(1)	#green
pin2 = mcp.get_pin(2)	#red
pin3 = mcp.get_pin(3)	#expansion terminal 'MCP3'

# Setup pin0 as an output that's at a high logic level.
pin0.switch_to_output(value=True)
pin1.switch_to_output(value=True)
pin2.switch_to_output(value=True)
 
# Setup pin1 as an input with a pull-up resistor enabled.  Notice you can also
# use properties to change this state.
pin3.direction = digitalio.Direction.INPUT
pin3.pull = digitalio.Pull.UP
 
# Now loop blinking

while True:
	pin0.value = False
	time.sleep(0.5)
	pin0.value = True
	time.sleep(0.5)
	pin1.value = False
	time.sleep(0.5)
	pin1.value = True
	time.sleep(0.5)
	pin2.value = False
	time.sleep(0.5)
	pin2.value = True
	time.sleep(0.5)
	
	# Read pin 3 and print its state.
	print("Pin 3 is at a high level: {0}".format(pin3.value))
	print("control +c to exit")