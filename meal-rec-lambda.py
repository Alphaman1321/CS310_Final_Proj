#meal recommender lambda function, also has 2 layers requests and pymysql
"""
sample output:
200
```json
{
  "suhoor_recommendation": "Oatmeal with chia seeds, topped with fresh berries and a dollop of Greek yogurt. Include a boiled egg for protein and a glass of water or herbal tea.",
  "iftar_recommendation": "Dates and a glass of water to break the fast, followed by a grilled chicken salad with mixed greens, cucumbers, tomatoes, olives, and a light olive oil dressing. Complement with a small portion of brown rice or whole wheat pita."
}
"""
import json
import os
import pymysql
import requests

DB_HOST = os.environ["DB_HOST"]
DB_USER = os.environ["DB_USER"]
DB_PASSWORD = os.environ["DB_PASSWORD"]
DB_NAME = os.environ["DB_NAME"]
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]


def lambda_handler(event, context):

    try:

        # ---------- Parse request ----------

        if "body" not in event:
            return {"statusCode":400,"body":"Missing request body"}

        body = json.loads(event["body"])

        username = body.get("username")

        if not username:
            return {"statusCode":400,"body":"username required"}

        # ---------- Connect to MySQL ----------

        conn = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            connect_timeout=5
        )

        with conn.cursor() as cursor:

            sql = """
            SELECT food_name, calories, protein_g, carbs_g, fat_g
            FROM meal_items
            WHERE username = %s
            ORDER BY created_at DESC
            LIMIT 20
            """

            cursor.execute(sql, (username,))
            rows = cursor.fetchall()

        conn.close()

        if not rows:
            return {
                "statusCode":200,
                "body":json.dumps({
                    "message":"No meal history found for user"
                })
            }

        # ---------- Convert Decimal values ----------

        meal_history = []

        for r in rows:

            meal_history.append({
                "food": r[0],
                "calories": float(r[1]) if r[1] else 0,
                "protein": float(r[2]) if r[2] else 0,
                "carbs": float(r[3]) if r[3] else 0,
                "fat": float(r[4]) if r[4] else 0
            })

        # ---------- GPT Recommendation ----------

        prompt = f"""
A user is fasting during Ramadan.

Based on their previous meals:

{json.dumps(meal_history)}

Recommend:
1. A healthy Suhoor meal
2. A healthy Iftar meal

Return ONLY JSON:

{{
 "suhoor_recommendation": "",
 "iftar_recommendation": ""
}}
"""

        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "gpt-4.1-mini",
            "messages": [
                {"role":"user","content":prompt}
            ],
            "temperature":0.7
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

        ai_text = data["choices"][0]["message"]["content"]

        return {
            "statusCode":200,
            "body": ai_text
        }

    except Exception as e:

        return {
            "statusCode":500,
            "body":json.dumps({"error":str(e)})
        }