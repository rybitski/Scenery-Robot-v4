/*
  Wireless E Stop for scenery robot
  Adapted by Chris Rybitski 2018
  This code runs on the robot
  ------------------------------------------------------------------------------------
  Support:
  Wireless ESTOP rev 1 2018
  RC Platform v1.1 2019
<<<<<<< Updated upstream
------------------------------------------------------------------------------------
=======
  Scenery Robot v3.1+
  ------------------------------------------------------------------------------------
  Update Log:
  10/31/19  Added output for D7 as secondary signal out
            Changed delayAdjust pin to A2
            Organized code and fixed overflow bug
  ------------------------------------------------------------------------------------
>>>>>>> Stashed changes
  Use at your own risk
  NRF24L01      Arduino
  CE       >     D8
  CSN      >     D10
  SCK      >     D13
  MO       >     D11
  MI       >     D12
  RO       >     Not used
  Blue LED   2
  Green LED  3
  Red LED    4
  Switch     5
  Output     6
  Pot        SDA-A4
  Not used   SCL-A5
*/



#include <SPI.h>
#include "nRF24L01.h"
#include "RF24.h"
#include "printf.h"

const int button = 5;
const int signalOUT = 6;
const int signalOUT2 = 7;
const int redLED = 4;
const int blueLED = 2;
const int greenLED = 3;
const int delayPin = A2;    //analog pin for threshold adjustment
bool LEDenable = true;      //controls LED output
int timeOUT = 0;            //stores count
int threshold = 500;          //decreases false positives, but increases reaction time



/*Radio*/
RF24 radio(8, 10);                                                      // SPI bus for E-Stop PCB are pins 8 and 10
const uint64_t pipes[2] = { 0xABCDABCD71LL, 0x544d52687CLL };           // Radio pipe addresses for the 2 nodes to communicate.
byte counter = 1;                                                       // A single byte to keep track of the data being sent back and forth


void setup() {

  pinMode(redLED, OUTPUT);
  pinMode(blueLED, OUTPUT);
  pinMode(greenLED, OUTPUT);
  pinMode(button, INPUT);
  pinMode(signalOUT, OUTPUT);
  pinMode(signalOUT2, OUTPUT);

  //turn LED off by default-----------------------
  digitalWrite(redLED, HIGH); //turn off red LED
  digitalWrite(blueLED, HIGH);//turn off red LED
  digitalWrite(greenLED, HIGH); //turn off red LED

  Serial.begin(115200);
  printf_begin();


  // Setup and configure rf radio

  radio.begin();

  radio.setAutoAck(1);                    // Ensure autoACK is enabled
  radio.enableAckPayload();               // Allow optional ack payloads
  radio.setRetries(0, 15);                // Smallest time between retries, max no. of retries(time, count) time in 250us multiples Max = 15
  radio.setPayloadSize(1);                // Here we are sending 1-byte payloads to test the call-response speed
  radio.openWritingPipe(pipes[1]);        // Both radios listen on the same pipes by default, and switch when writing
  radio.openReadingPipe(1, pipes[0]);
  radio.startListening();                 // Start listening
  radio.setPALevel(RF24_PA_MAX);          // Set PA to max  RF24_PA_MIN = 0, RF24_PA_LOW, RF24_PA_HIGH, RF24_PA_MAX
  radio.printDetails();                   // Dump the configuration of the rf unit for debugging


  //check to see if the LEDs should be turned off
  if (digitalRead(button) == HIGH) {  //disables LED output on Robot if jumper is present
    LEDenable = false;
  }

  //allow user to adjust the threshold by adjusting a potentiometer. for each adjustment the arduino must be reset.
  threshold = (analogRead(delayPin) + 250);
  Serial.println(threshold);
}

void loop() {

  byte pipeNo;
  byte gotByte;

  while ( radio.available(&pipeNo)) {              // Dump the payloads until we've gotten everything
    radio.read( &gotByte, 1 );
    radio.writeAckPayload(pipeNo, &gotByte, 1 );
    timeOUT = 0;                                  //message received, reset counter
 //  Serial.println(gotByte);
  }


  if (gotByte == 42 && timeOUT < threshold) {
    statusOK();
    gotByte = 1;    //reset message
  }

  else {
    if (timeOUT > threshold)        //only diasble if threshold is exceeded
    {
      emergency();
    }

  }

  if(timeOUT < 3000){               //Prevent overflow
  timeOUT++;                        //increment counter
  }
 // Serial.println(timeOUT);
 delay(1);

}

void emergency() {
  digitalWrite (signalOUT, LOW);   //disable output
  digitalWrite (signalOUT2, LOW);   //disable output

  //only change the LED if the jumper was present at startup
  if (LEDenable == true) {
    digitalWrite(greenLED, HIGH);    //turn off green LED
    digitalWrite(redLED, LOW);      //turn on red LED
  }
}

void statusOK() {
  digitalWrite (signalOUT, HIGH);   //enable output
  digitalWrite (signalOUT2, HIGH);   //enable output

  //only change the LED if the jumper was present at startup
  if (LEDenable == true) {
    digitalWrite(redLED, HIGH);       //turn off red LED
    digitalWrite(greenLED, LOW);          //turn on green LED
  }
}
