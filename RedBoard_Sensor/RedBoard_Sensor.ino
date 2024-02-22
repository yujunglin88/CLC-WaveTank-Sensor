#include <Wire.h>
#include "SparkFunBMP384.h"
#include "ArduinoJson.h"

// Create a new sensor object
BMP384 pressureSensor_1;
BMP384 pressureSensor_2;
JsonDocument json;
// I2C address selection
uint8_t i2cAddress_1 = BMP384_I2C_ADDRESS_DEFAULT; // 0x77
uint8_t i2cAddress_2 = BMP384_I2C_ADDRESS_SECONDARY; // 0x76

void setup()
{
    // Start serial
    Serial.begin(9600);

    // Initialize the I2C library
    Wire.begin();

    // Check if sensor is connected and initialize
    // Address is optional (defaults to 0x77)
    while(pressureSensor_1.beginI2C(i2cAddress_1) != BMP3_OK)
    {
        // Not connected, inform user
        Serial.println("Error: BMP384_1 not connected, check wiring and I2C address!");

        // Wait a bit to see if connection is established
        delay(1000);
    }
    while(pressureSensor_2.beginI2C(i2cAddress_2) != BMP3_OK)
    {
        // Not connected, inform user
        Serial.println("Error: BMP384_2 not connected, check wiring and I2C address!");
    
        // Wait a bit to see if connection is established
        delay(1000);
    }
}

void loop()
{
    // Get measurements from the sensor
    bmp3_data data_1;
    bmp3_data data_2;
    int8_t err_1 = pressureSensor_1.getSensorData(&data_1);
    int8_t err_2 = pressureSensor_2.getSensorData(&data_2);

    // Check whether data was acquired successfully
    if(err_1 == BMP3_OK && err_2 == BMP3_OK)
    {
        // Acquisistion succeeded, print temperature and pressure
        json["pressure_1"] = data_1.pressure;
        json["pressure_2"] = data_2.pressure;
        serializeJson(json, Serial);
        Serial.println();
    }
    else
    {
        // Acquisition failed, most likely a communication error (code -2)
        Serial.print("Error getting data from sensor! Error code: ");
        Serial.println(err_1);
    }

    // Only print every second
    delay(100);
}