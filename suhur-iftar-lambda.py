"""
This is the API that returns the time for suhur and iftar (alrdy done)
"""

import json
import urllib.request
from datetime import datetime

def lambda_handler(event, context):

    try:
        params = event.get("queryStringParameters", {})
        lat = params.get("lat")
        lon = params.get("lon")

        if not lat or not lon:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "lat and lon required"})
            }

        today = datetime.now().strftime("%d-%m-%Y")

        url = f"http://api.aladhan.com/v1/timings/{today}?latitude={lat}&longitude={lon}&method=2"

        response = urllib.request.urlopen(url)
        data = json.loads(response.read())

        timings = data["data"]["timings"]
        date_info = data["data"]["date"]

        result = {
            "date": date_info["gregorian"]["date"],
            "hijri": date_info["hijri"]["date"],
            "suhoor": timings["Fajr"],
            "iftar": timings["Maghrib"]
        }

        return {
            "statusCode": 200,
            "body": json.dumps(result)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }