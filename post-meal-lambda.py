""""
This is the post-meal function in lambda, it has 2 layers added, requests and pymysql, we setup the db and the s3 bucket allowing public read access
all secret keys are stored as env variables for security
sample return: 
Status: 200
{"food_name": "Domino's cheese pizza slice", "serving_qty": 1, "serving_unit": "slice", "calories": 200, "protein_g": 10, "carbs_g": 26, "fat_g": 8, "saturated_fat_g": 4, "cholesterol_mg": 20, "sodium_mg": 400, "fiber_g": 1, "sugars_g": 3, "potassium_mg": 150, "username": "abdullah", "image_url": "https://ramadan-meal-images.s3.amazonaws.com/meals/01fec8b4-c1d5-4d74-bc3e-4347445dd314.jpg", "logged_at": "2026-03-12"}
"""

import json
import base64
import uuid
import boto3
import os
import pymysql
import requests
import re
from datetime import date

s3 = boto3.client("s3")

DB_HOST = os.environ["DB_HOST"]
DB_USER = os.environ["DB_USER"]
DB_PASSWORD = os.environ["DB_PASSWORD"]
DB_NAME = os.environ["DB_NAME"]
S3_BUCKET = os.environ["S3_BUCKET"]
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]


def lambda_handler(event, context):

    try:

        # ---------- Parse request ----------

        if "body" not in event:
            return {"statusCode":400,"body":"Missing request body"}

        body = json.loads(event["body"])

        username = body.get("username")
        image_data = body.get("image")

        if not username or not image_data:
            return {"statusCode":400,"body":"username and image required"}

        # ---------- Decode image ----------

        try:
            image_bytes = base64.b64decode(image_data)
        except:
            return {"statusCode":400,"body":"Invalid base64 image"}

        # ---------- Upload image to S3 ----------

        meal_uuid = str(uuid.uuid4())
        s3_key = f"meals/{meal_uuid}.jpg"

        s3.put_object(
            Bucket=S3_BUCKET,
            Key=s3_key,
            Body=image_bytes,
            ContentType="image/jpeg"
        )

        image_url = f"https://{S3_BUCKET}.s3.amazonaws.com/{s3_key}"

        # ---------- GPT Vision request ----------

        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }

        prompt = """
Analyze the food in this image.

Return ONLY valid JSON.

{
 "food_name":"",
 "serving_qty":1,
 "serving_unit":"",
 "calories":0,
 "protein_g":0,
 "carbs_g":0,
 "fat_g":0,
 "saturated_fat_g":0,
 "cholesterol_mg":0,
 "sodium_mg":0,
 "fiber_g":0,
 "sugars_g":0,
 "potassium_mg":0
}

If there is no food, return food_name="not_food".
"""

        payload = {
            "model": "gpt-4.1-mini",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type":"text","text":prompt},
                        {"type":"image_url","image_url":{"url":image_url}}
                    ]
                }
            ],
            "temperature": 0
        }

        res = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )

        data = res.json()

        if "choices" not in data:
            return {
                "statusCode":500,
                "body":json.dumps({
                    "error":"OpenAI API error",
                    "response":data
                })
            }

        ai_text = data["choices"][0]["message"]["content"].strip()

        # ---------- Extract JSON safely ----------

        try:
            nutrition = json.loads(ai_text)
        except:
            match = re.search(r"\{.*\}", ai_text, re.DOTALL)
            if match:
                nutrition = json.loads(match.group())
            else:
                return {
                    "statusCode":500,
                    "body":json.dumps({
                        "error":"Invalid GPT response",
                        "response":ai_text
                    })
                }

        # ---------- Extract values ----------

        food_name = nutrition.get("food_name")
        serving_qty = nutrition.get("serving_qty")
        serving_unit = nutrition.get("serving_unit")
        calories = nutrition.get("calories")
        protein = nutrition.get("protein_g")
        carbs = nutrition.get("carbs_g")
        fat = nutrition.get("fat_g")
        sat_fat = nutrition.get("saturated_fat_g")
        cholesterol = nutrition.get("cholesterol_mg")
        sodium = nutrition.get("sodium_mg")
        fiber = nutrition.get("fiber_g")
        sugars = nutrition.get("sugars_g")
        potassium = nutrition.get("potassium_mg")

        # ---------- Insert into MySQL ----------

        conn = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            connect_timeout=5
        )

        with conn.cursor() as cursor:

            sql = """
            INSERT INTO meal_items(
            username,logged_at,food_name,
            serving_qty,serving_unit,
            calories,protein_g,carbs_g,fat_g,
            saturated_fat_g,cholesterol_mg,sodium_mg,
            fiber_g,sugars_g,potassium_mg,
            image_url,nutrition_raw
            )
            VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """

            cursor.execute(sql,(
                username,
                date.today(),
                food_name,
                serving_qty,
                serving_unit,
                calories,
                protein,
                carbs,
                fat,
                sat_fat,
                cholesterol,
                sodium,
                fiber,
                sugars,
                potassium,
                image_url,
                json.dumps(nutrition)
            ))

            conn.commit()

        conn.close()

        nutrition["username"] = username
        nutrition["image_url"] = image_url
        nutrition["logged_at"] = str(date.today())

        return {
            "statusCode":200,
            "body":json.dumps(nutrition)
        }

    except Exception as e:

        return {
            "statusCode":500,
            "body":json.dumps({"error":str(e)})
        }