from flask import Flask, request, jsonify, render_template
import time
import numpy as np
from sklearn.linear_model import LinearRegression

app = Flask(__name__)

data_store = {
    "pm25": 0,
    "gas": 0
}

history = []


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

    return jsonify({

        "current": data_store,

        "history": history[-20:],

        "prediction": prediction
    })


@app.route("/update", methods=["POST"])
def update():

    global data_store, history

    data = request.get_json()

    data_store["pm25"] = data["pm25"]
    data_store["gas"] = data["gas"]

    data_store["time"] = time.strftime("%H:%M:%S")

    history.append(data_store.copy())

    return jsonify({
        "status": "ok"
    })


if __name__ == "__main__":

    app.run(host="0.0.0.0", port=5000, debug=True)