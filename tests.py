#this tests the post meal lambda function, it sends a sample image and username to the API gateway endpoint, which then triggers the lambda function, the response is printed out, you can change the image and username to test with different data, make sure to have the correct permissions set up for the s3 bucket and the database for it to work properly


import base64
import requests

API_URL = "https://nopd4hs5hi.execute-api.us-east-2.amazonaws.com/Proj/post-meal" #endpoint is this

with open("food.jpg", "rb") as f:
    img = base64.b64encode(f.read()).decode()

payload = { #too lazy to make it not require a user, so ppl hav to sign in to upload something, i need to add a users db tho
    "username": "abdullah",
    "image": img
}

res = requests.post(API_URL, json=payload)

print("Status:", res.status_code)
print(res.text)