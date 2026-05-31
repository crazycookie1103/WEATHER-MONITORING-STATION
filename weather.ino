#include <WiFi.h>
#include <WebServer.h>
#include <TFT_eSPI.h>
#include <DHT.h>
#include <Adafruit_BMP280.h>

// ================= WIFI =================
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

// ================= TFT =================
TFT_eSPI tft = TFT_eSPI();

// ================= WEB SERVER =================
WebServer server(80);

// ================= DHT11 =================
#define DHTPIN 4
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

// ================= BMP280 =================
Adafruit_BMP280 bmp;

// ================= LDR =================
#define LDR_PIN 34

// ================= VARIABLES =================
float temperature = 0;
float humidity = 0;
float pressure = 0;
float altitude = 0;

int ldrRaw = 0;
int lightPercent = 0;

unsigned long lastUpdate = 0;

// =====================================================
// BETTER WEBPAGE
// =====================================================

void handleRoot() {

  String html = R"rawliteral(

<!DOCTYPE html>
<html>

<head>

<meta name="viewport" content="width=device-width, initial-scale=1">

<meta http-equiv="refresh" content="2">

<title>ESP32 Weather Station</title>

<style>

body{
    background:#0f172a;
    color:white;
    font-family:Arial;
    margin:0;
    padding:20px;
}

h1{
    text-align:center;
    color:#38bdf8;
}

.container{
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
    gap:20px;
    margin-top:30px;
}

.card{
    background:#1e293b;
    border-radius:20px;
    padding:20px;
    text-align:center;
    box-shadow:0 0 15px rgba(0,0,0,0.3);
}

.value{
    font-size:35px;
    margin-top:10px;
    color:#22c55e;
}

.label{
    font-size:18px;
    color:#cbd5e1;
}

</style>

</head>

<body>

<h1>ESP32 Weather Station</h1>

<div class="container">

<div class="card">
<div class="label">Temperature</div>
<div class="value">)rawliteral";

  html += String(temperature,1);

  html += R"rawliteral( °C</div>
</div>

<div class="card">
<div class="label">Humidity</div>
<div class="value">)rawliteral";

  html += String(humidity,1);

  html += R"rawliteral( %</div>
</div>

<div class="card">
<div class="label">Pressure</div>
<div class="value">)rawliteral";

  html += String(pressure,1);

  html += R"rawliteral( hPa</div>
</div>

<div class="card">
<div class="label">Altitude</div>
<div class="value">)rawliteral";

  html += String(altitude,1);

  html += R"rawliteral( m</div>
</div>

<div class="card">
<div class="label">Light Level</div>
<div class="value">)rawliteral";

  html += String(lightPercent);

  html += R"rawliteral( %</div>
</div>

</div>

</body>
</html>

)rawliteral";

  server.send(200, "text/html", html);
}

// =====================================================
// TFT STATIC UI
// =====================================================

void drawUI() {

  tft.fillScreen(TFT_BLACK);

  tft.setTextColor(TFT_CYAN, TFT_BLACK);

  tft.setTextSize(2);

  tft.setCursor(0,0);
  tft.println("ESP32 WEATHER");

  tft.setTextColor(TFT_WHITE, TFT_BLACK);

  tft.setCursor(0,40);
  tft.println("Temp:");

  tft.setCursor(0,70);
  tft.println("Humidity:");

  tft.setCursor(0,100);
  tft.println("Pressure:");

  tft.setCursor(0,130);
  tft.println("Altitude:");

  tft.setCursor(0,160);
  tft.println("Light:");
}

// =====================================================
// UPDATE TFT VALUES ONLY
// =====================================================

void updateTFT() {

  tft.setTextColor(TFT_GREEN, TFT_BLACK);

  tft.fillRect(120,40,120,20,TFT_BLACK);
  tft.setCursor(120,40);
  tft.print(temperature,1);
  tft.print(" C");

  tft.fillRect(120,70,120,20,TFT_BLACK);
  tft.setCursor(120,70);
  tft.print(humidity,1);
  tft.print(" %");

  tft.fillRect(120,100,120,20,TFT_BLACK);
  tft.setCursor(120,100);
  tft.print(pressure,1);
  tft.print(" hPa");

  tft.fillRect(120,130,120,20,TFT_BLACK);
  tft.setCursor(120,130);
  tft.print(altitude,1);
  tft.print(" m");

  tft.fillRect(120,160,120,20,TFT_BLACK);
  tft.setCursor(120,160);
  tft.print(lightPercent);
  tft.print(" %");
}

// =====================================================
// SETUP
// =====================================================

void setup() {

  Serial.begin(115200);

  // TFT
  tft.init();
  tft.setRotation(1);

  drawUI();

  // DHT
  dht.begin();

  // BMP280
  if (!bmp.begin(0x76)) {

    tft.setCursor(0,200);
    tft.println("BMP280 ERROR");

    while(1);
  }

  // WIFI
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();

  delay(1000);

  WiFi.begin(ssid, password);

  tft.setCursor(0,200);
  tft.println("Connecting WiFi");

  while (WiFi.status() != WL_CONNECTED) {

    delay(500);

    Serial.print(".");
  }

  tft.fillRect(0,200,240,20,TFT_BLACK);

  tft.setCursor(0,200);

  tft.println(WiFi.localIP());

  Serial.println(WiFi.localIP());

  // WEBPAGE
  server.on("/", handleRoot);

  server.begin();
}

// =====================================================
// LOOP
// =====================================================

void loop() {

  server.handleClient();

  if (millis() - lastUpdate > 2000) {

    lastUpdate = millis();

    // DHT11
    temperature = dht.readTemperature();
    humidity = dht.readHumidity();

    // BMP280
    pressure = bmp.readPressure() / 100.0F;

    altitude = bmp.readAltitude(1013.25);

    // LDR
    ldrRaw = analogRead(LDR_PIN);

    // Convert to percentage
    lightPercent = map(ldrRaw, 0, 4095, 0, 100);

    // Limit values
    lightPercent = constrain(lightPercent, 0, 100);

    // UPDATE TFT
    updateTFT();
  }
}
