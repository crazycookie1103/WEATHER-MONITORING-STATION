# Weather Monitoring System (ESP32)

A compact IoT-based weather monitoring system that measures environmental parameters and displays them on an TFT SPI. Data is also transmitted over WiFi for cloud storage and remote access.

## Features
- Temperature and Humidity measurement  
- Atmospheric Pressure and Altitude calculation  
- Light Intensity detection  
- TFT display with button-based parameter switching  
- WiFi-enabled data logging on web page
- 3d printed enclosure 

## Hardware Components
- ESP32 – Main microcontroller with built-in WiFi  
- DHT11 – Temperature and humidity sensor  
- BMP280 – Pressure and altitude sensor (I2C)  
- LDR – Light intensity sensing  
- TFT SPI  
- toggle switch
- lm7805 linear voltage regulator and lion batteries


## Working
- Sensors continuously collect environmental data
- data displayed both on tft and webpage
-  ESP32 processes and displays the selected parameter  
- Data is transmitted over WiFi  

## Cloud Integration
- Data sent via ESP32 WiFi  
- Compatible with ThingSpeak, Firebase, or MQTT servers  


