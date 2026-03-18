# Weather Monitoring System (ESP32)

A compact IoT-based weather monitoring system that measures environmental parameters and displays them on an OLED. Data is also transmitted over WiFi for cloud storage and remote access.

## Features
- Temperature and Humidity measurement  
- Atmospheric Pressure and Altitude calculation  
- Light Intensity detection  
- OLED display with button-based parameter switching  
- WiFi-enabled cloud data logging  

## Hardware Components
- ESP32 – Main microcontroller with built-in WiFi  
- DHT11 – Temperature and humidity sensor  
- BMP280 – Pressure and altitude sensor (I2C)  
- LDR – Light intensity sensing  
- OLED Display (SSD1306) – Output display via I2C  
- Push Button – Switch between parameters  
- AMS1117 LDO – Voltage regulation  
- TP4056 – Battery charging module  

## ICs Used
- ESP32 SoC – Processing, WiFi communication, and control logic  
- BMP280 IC – Digital pressure and altitude sensing  
- SSD1306 IC – OLED display driver  
- AMS1117 IC – 3.3V voltage regulation  
- TP4056 IC – Battery charging and protection  

## Working
- Sensors continuously collect environmental data  
- A single push button cycles through parameters on the OLED  
- ESP32 processes and displays the selected parameter  
- Data is transmitted over WiFi to cloud storage  

## Cloud Integration
- Data sent via ESP32 WiFi  
- Compatible with ThingSpeak, Firebase, or MQTT servers  


