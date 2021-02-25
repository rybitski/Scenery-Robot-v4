import time
import board
import busio
import adafruit_ads1x15.ads1015 as ADS
from adafruit_ads1x15.analog_in import AnalogIn

# Create the I2C bus
i2c = busio.I2C(board.SCL, board.SDA)

# Create the ADC object using the I2C bus
ads = ADS.ADS1015(i2c)

# Create single-ended input on channel 0
chan = AnalogIn(ads, ADS.P0)

#Gain
ads.gain = 2/3	# 0-6.144V

# Create differential input between channel 0 and 1
# chan = AnalogIn(ads, ADS.P0, ADS.P1)
#print("{:>5}\t{:>5}".format("raw", "v"))

while True:
	#(ADC Value * Max ADC voltage)/16bit Max value)/(Resistor 2/(Resistor 1 + Resistor 2)) 
	voltOUT = ((chan.value*6.144)/32767.0)/(2198.0/(9960.0+2198.0))
	print(voltOUT)
	#print("{:>5}\t{:>5.3f}".format(chan.value, chan.voltage)) #prints raw values
	time.sleep(0.5)