#include <Wire.h>
#include <Adafruit_BMP280.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_GFX.h>
#include "DHT.h"

#define DHTPIN 4
#define DHTTYPE DHT11
#define LDR_PIN 34
#define BUTTON_PIN 15

DHT dht(DHTPIN, DHTTYPE);
Adafruit_BMP280 bmp;
Adafruit_SSD1306 display(128, 64, &Wire);

int mode = 0;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  pinMode(BUTTON_PIN, INPUT_PULLUP);

  dht.begin();
  bmp.begin(0x76);

  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
}

void loop() {

  // -------- BUTTON PRESS DETECTION --------
  if (digitalRead(BUTTON_PIN) == LOW) {
    delay(200); // debounce
    mode++;
    if (mode > 4) mode = 0;

    // wait until button released
    while (digitalRead(BUTTON_PIN) == LOW);
  }

  // -------- SENSOR READ --------
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  float pressure = bmp.readPressure() / 100.0;
  float altitude = bmp.readAltitude(1013.25);
  int light = analogRead(LDR_PIN);

  // -------- DISPLAY --------
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(WHITE);

  display.setCursor(0,0);

  switch(mode) {

    case 0:
      display.println("TEMP");
      display.print(temp);
      display.println(" C");
      break;

    case 1:
      display.println("HUM");
      display.print(hum);
      display.println(" %");
      break;

    case 2:
      display.println("PRESS");
      display.print(pressure);
      display.println(" hPa");
      break;

    case 3:
      display.println("ALT");
      display.print(altitude);
      display.println(" m");
      break;

    case 4:
      display.println("LIGHT");
      display.println(light);
      break;
  }

  display.display();
}
