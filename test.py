import requests
import random
import time

while True:

    data = {
        "pm25": random.randint(10, 80),
        "gas": random.randint(100, 500)
    }

    requests.post(
        "http://127.0.0.1:5000/update",
        json=data
    )

    print("Sent:", data)

    time.sleep(2)