import requests

url = "https://nopd4hs5hi.execute-api.us-east-2.amazonaws.com/Proj/meal-recommender"

payload = {
    "username": "abdullah",
    "query": "high protein suhoor meal"
}

res = requests.post(url, json=payload)

print(res.status_code)
print(res.text)