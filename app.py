from flask import Flask, request, jsonify, render_template
import time
import numpy as np
from sklearn.linear_model import LinearRegression
import requests
import sqlite3

app = Flask(__name__)

data_store = {
    "pm25": 0,
    "gas": 0
}

history = []


# =========================
# DATABASE
# =========================

def init_db():

    conn = sqlite3.connect("aqi.db")

    cursor = conn.cursor()

    cursor.execute("""

    CREATE TABLE IF NOT EXISTS readings (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        pm25 REAL,

        gas REAL,

        timestamp TEXT
    )

    """)

    conn.commit()

    conn.close()


init_db()


# =========================
# AQI PREDICTOR
# =========================

class AQIPredictor:

    def predict(self, values):

        x = np.array(range(len(values))).reshape(-1, 1)

        y = np.array(values)

        model = LinearRegression()

        model.fit(x, y)

        future = np.array([[len(values) + 1]])

        prediction = model.predict(future)

        return round(float(prediction[0]), 2)


predictor = AQIPredictor()


# =========================
# WEATHER API
# =========================

API_KEY = "77f3efbce0c812e2161df6c7d3a2bddc"

LAT = 31.515355
LON = 76.878331


def get_weather():

    url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?lat={LAT}"
        f"&lon={LON}"
        f"&appid={API_KEY}"
        f"&units=metric"
    )

    response = requests.get(url)

    data = response.json()

    return {

        "temp": data["main"]["temp"],

        "humidity": data["main"]["humidity"],

        "wind": data["wind"]["speed"],

        "weather": data["weather"][0]["main"]
    }


# =========================
# ROUTES
# =========================

@app.route("/")
def home():

    return render_template("index.html")


@app.route("/data")
def data():

    pm_values = [
        item["pm25"]
        for item in history[-20:]
    ]

    prediction = 0

    if len(pm_values) > 3:

        prediction = predictor.predict(pm_values)

    weather = get_weather()

    return jsonify({

        "current": data_store,

        "history": history[-20:],

        "prediction": prediction,

        "weather": weather
    })


@app.route("/update", methods=["POST"])
def update():

    global data_store, history

    data = request.get_json()

    data_store["pm25"] = data["pm25"]

    data_store["gas"] = data["gas"]

    data_store["time"] = time.strftime("%H:%M:%S")

    history.append(data_store.copy())

    # SAVE TO DATABASE

    conn = sqlite3.connect("aqi.db")

    cursor = conn.cursor()

    cursor.execute("""

    INSERT INTO readings (
    pm25,
    gas,
    timestamp
    )

    VALUES (?, ?, ?)

    """, (

        data_store["pm25"],
        data_store["gas"],
        data_store["time"]

    ))

    conn.commit()

    conn.close()

    return jsonify({
        "status": "ok"
    })


# =========================
# RUN APP
# =========================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )