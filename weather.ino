#include <WiFi.h>
#include <HTTPClient.h>
#include <TFT_eSPI.h>
#include <DHT.h>
#include <Adafruit_BMP280.h>
#include <WiFiClientSecure.h>
// ================= WIFI =================
const char* ssid     = ".......";
const char* password = "............";

// ================= BACKEND =================
const char* serverURL = "https://weather-monitoring-station.onrender.com/api/readings";
const char* API_KEY   = "......";   // must match your .env API_KEY

// ================= TFT =================
TFT_eSPI tft = TFT_eSPI();

// ================= DHT =================
#define DHTPIN  4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// ================= BMP280 =================
Adafruit_BMP280 bmp;

// ================= LDR =================
#define LDR_PIN 34

// ================= VARIABLES =================
float temperature  = 0;
float humidity     = 0;
float pressure     = 0;
float altitude     = 0;
int   ldrRaw       = 0;
int   lightPercent = 0;

unsigned long lastSensorRead = 0;
unsigned long lastPost       = 0;

#define SENSOR_INTERVAL 2000    // read sensors every 2s (for TFT display)
#define POST_INTERVAL   30000   // POST to server every 30s

// ================= SETUP =================
void setup() {
  Serial.begin(115200);

  tft.init();
  tft.setRotation(1);
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(TFT_WHITE, TFT_BLACK);
  tft.setTextSize(2);
  tft.setCursor(0, 0);
  tft.println("Starting...");

  dht.begin();

  if (!bmp.begin(0x76)) {
    Serial.println("BMP280 not found!");
    tft.println("BMP280 ERROR");
    while (1) delay(500);
  }

  tft.println("Connecting WiFi...");
  WiFi.begin(ssid, password);
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 20) {
    delay(500);
    Serial.print(".");
    tries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected: " + WiFi.localIP().toString());
    tft.println("WiFi OK");
    tft.println(WiFi.localIP().toString());
  } else {
    Serial.println("\nWiFi FAILED — running offline");
    tft.println("WiFi FAILED");
  }

  delay(1000);
}

// ================= READ SENSORS =================
void readSensors() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (!isnan(t)) temperature = t;
  if (!isnan(h)) humidity    = h;

  pressure  = bmp.readPressure() / 100.0F;
  altitude  = bmp.readAltitude(1013.25);
  ldrRaw    = analogRead(LDR_PIN);
  lightPercent = constrain(map(ldrRaw, 0, 4095, 0, 100), 0, 100);
}

// ================= UPDATE TFT =================
void updateDisplay() {

  tft.fillScreen(TFT_BLACK);

  tft.setTextSize(3);
  tft.setTextColor(TFT_WHITE, TFT_BLACK);
  tft.setCursor(10, 5);
  tft.println("Temperature");

  tft.setTextSize(4);
  tft.setTextColor(TFT_CYAN, TFT_BLACK);
  tft.setCursor(10, 35);
  tft.printf("%.1f C", temperature);

  tft.setTextSize(2);

  tft.setTextColor(TFT_GREEN, TFT_BLACK);
  tft.setCursor(10, 110);
  tft.printf("Humidity : %.1f %%", humidity);

  tft.setTextColor(TFT_YELLOW, TFT_BLACK);
  tft.setCursor(10, 140);
  tft.printf("Pressure : %.1f hPa", pressure);

  tft.setTextColor(TFT_WHITE, TFT_BLACK);
  tft.setCursor(10, 170);
  tft.printf("Altitude : %.1f m", altitude);

  tft.setTextColor(TFT_MAGENTA, TFT_BLACK);
  tft.setCursor(10, 200);
  tft.printf("Light : %d %%", lightPercent);

  tft.setTextColor(TFT_GREEN, TFT_BLACK);
  tft.setCursor(200, 200);

  if (WiFi.status() == WL_CONNECTED)
    tft.print("WiFi OK");
  else
    tft.print("WiFi FAIL");
}

// ================= POST TO SERVER =================
void postReadings() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("POST skipped — no WiFi");
    return;
  }

 WiFiClientSecure client;
client.setInsecure();   //  (allows HTTPS without cert)

HTTPClient http;
http.begin(client, serverURL);  // client added here

http.addHeader("Content-Type", "application/json");
http.addHeader("X-API-Key", API_KEY);
  http.setTimeout(10000);   // 10s timeout

  // Build JSON manually — no ArduinoJson needed
  String body = "{";
  body += "\"temperature\":"   + String(temperature,  2) + ",";
  body += "\"humidity\":"      + String(humidity,     2) + ",";
  body += "\"pressure\":"      + String(pressure,     2) + ",";
  body += "\"altitude\":"      + String(altitude,     2) + ",";
  body += "\"light_percent\":" + String(lightPercent)    + ",";
  body += "\"ldr_raw\":"       + String(ldrRaw);
  body += "}";

  Serial.println("Posting: " + body);
  int code = http.POST(body);

  if (code == 200 || code == 201) {
    Serial.println("POST OK — " + String(code));
    tft.setTextColor(TFT_GREEN, TFT_BLACK);
    tft.setCursor(0, 108);
    tft.println("Last post: OK");
  } else {
    Serial.println("POST FAILED — code: " + String(code));
    tft.setTextColor(TFT_RED, TFT_BLACK);
    tft.setCursor(0, 108);
    tft.printf("POST failed: %d", code);
  }

  http.end();
}

// ================= LOOP =================
void loop() {
  unsigned long now = millis();

  // Read sensors every 2s and update TFT
  if (now - lastSensorRead >= SENSOR_INTERVAL) {
    lastSensorRead = now;
    readSensors();
    updateDisplay();
  }

  // POST to server every 30s
  if (now - lastPost >= POST_INTERVAL) {
    lastPost = now;
    postReadings();
  }
}
