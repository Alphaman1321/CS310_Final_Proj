import base64
import requests

API_URL = "https://nopd4hs5hi.execute-api.us-east-2.amazonaws.com/Proj/post-meal"

with open("food.jpg", "rb") as f:
    img = base64.b64encode(f.read()).decode()

payload = {
    "username": "abdullah",
    "image": img
}

res = requests.post(API_URL, json=payload)

print("Status:", res.status_code)
print(res.text)