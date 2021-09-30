/*
  Wireless E Stop for scenery robot
  Adapted by Chris Rybitski 2018
  This code runs on the remote
------------------------------------------------------------------------------------
Support:
  Wireless ESTOP rev 1 2018
  Safety Stop V2 2019
------------------------------------------------------------------------------------
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
*/



#include <SPI.h>
#include "nRF24L01.h"
#include "RF24.h"
#include "printf.h"
#include <Wire.h>                 //for LCD I2C
#include <LiquidCrystal_I2C.h>    //for LCD

const int button = 5;
const int signalOUT = 6;
const int redLED = 4;
const int blueLED = 2;
const int greenLED = 3;

int timeOUT = 0;            //stores count
int threshold = 50;          //decreases false positives, but increases reaction time

//LCD Parameters
LiquidCrystal_I2C lcd(0x27, 16, 2);

// SPI bus for E-Stop PCB are pins 8 and 10
RF24 radio(8, 10);

// Topology
const uint64_t pipes[2] = { 0xABCDABCD71LL, 0x544d52687CLL };              // Radio pipe addresses for the 2 nodes to communicate.


// A single byte to keep track of the data being sent back and forth
byte counter = 42;

void setup() {

  pinMode(redLED, OUTPUT);
  pinMode(blueLED, OUTPUT);
  pinMode(greenLED, OUTPUT);
  pinMode(button, INPUT);
  pinMode(signalOUT, OUTPUT);

  //turn LED off by default-----------------------
  digitalWrite(redLED, HIGH); //turn off red LED
  digitalWrite(blueLED, HIGH);//turn off red LED
  digitalWrite(greenLED, HIGH); //turn off red LED

  //LDC
  lcd.begin();
  lcd.backlight();
  lcd.print("Wireless E-Stop");

  Serial.begin(115200);
  printf_begin();


  // Setup and configure rf radio

  radio.begin();
  radio.setAutoAck(1);                    // Ensure autoACK is enabled
  radio.enableAckPayload();               // Allow optional ack payloads
  radio.setRetries(0, 15);                // Smallest time between retries, max no. of retries (time, count) time in 250us multiples Max = 15
  radio.setPayloadSize(1);                // Here we are sending 1-byte payloads to test the call-response speed
  radio.openWritingPipe(pipes[1]);        // Both radios listen on the same pipes by default, and switch when writing
  radio.openReadingPipe(1, pipes[0]);
  radio.startListening();                 // Start listening
  radio.setPALevel(RF24_PA_MAX);          // Set PA to max  RF24_PA_MIN = 0, RF24_PA_LOW, RF24_PA_HIGH, RF24_PA_MAX
  radio.printDetails();                   // Dump the configuration of the rf unit for debugging

  // Become the primary transmitter (ping out)
  radio.openWritingPipe(pipes[0]);
  radio.openReadingPipe(1, pipes[1]);
}

void loop(void) {

  if (digitalRead(button) == HIGH)
  {
    //------------display stuff----- Green light------------------------------
    digitalWrite(redLED, HIGH);       //turn off red LED
    digitalWrite(greenLED, LOW);          //turn on green LED
    lcd.setCursor(0, 1);
    lcd.print("GO       LINK:");


    radio.stopListening();                                  // First, stop listening so we can talk.

    printf("Now sending %d as payload. ", counter);
    byte gotByte;
    unsigned long time = micros();                          // Take the time, and send it.  This will block until complete
    //Called when STANDBY-I mode is engaged (User is finished sending)
    if (!radio.write( &counter, 1 )) {
      Serial.println(F("failed."));
      lcd.setCursor(14, 1);
      lcd.print("NO");
      digitalWrite(greenLED, HIGH);         //turn off green LED
      digitalWrite(redLED, HIGH);      //turn off red LED
      digitalWrite(blueLED, LOW);         //turn on blue LED
    }
    else {

      if (!radio.available()) {
        Serial.println(F("Blank Payload Received."));

        lcd.setCursor(14, 1);
        lcd.print("NO");
        digitalWrite(greenLED, HIGH);         //turn off green LED
        digitalWrite(redLED, HIGH);      //turn off red LED
        digitalWrite(blueLED, LOW);         //turn on blue LED




      } else {
        while (radio.available() ) {
          unsigned long tim = micros();
          radio.read( &gotByte, 1 );
          printf("Got response %d, round-trip delay: %lu microseconds\n\r", gotByte, tim - time);


          timeOUT = 0;                     //message received, reset counter
          digitalWrite(blueLED, HIGH);         //turn off blue LED
          lcd.setCursor(14, 1);
          lcd.print("OK");

        }
      }
    }

  }

  //E Stop Pressed - don't send anything and update displays
  else {
    digitalWrite(greenLED, HIGH);         //turn off green LED
    digitalWrite(blueLED, HIGH);         //turn off blue LED
    digitalWrite(redLED, LOW);      //turn on red LED
    lcd.setCursor(0, 1);
    lcd.print("   EMERGENCY    ");
  }

}
© 2021 GitHub, Inc.
