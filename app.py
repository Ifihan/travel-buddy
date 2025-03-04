from flask import Flask, request, jsonify, render_template
from google import genai
from google.genai import types
from dotenv import load_dotenv
import re

import os

load_dotenv()

GOOGLE_CLOUD_PROJECT = os.environ.get("GOOGLE_CLOUD_PROJECT")
GOOGLE_CLOUD_LOCATION = os.environ.get("GOOGLE_CLOUD_LOCATION")

app = Flask(__name__, template_folder="templates", static_folder="static")

client = genai.Client(
    vertexai=True, project=GOOGLE_CLOUD_PROJECT, location=GOOGLE_CLOUD_LOCATION
)

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/chat", methods=["GET", "POST"])
def chatbot():
    return render_template("chat.html")


def clean_ai_response(text):
    """Clean and format AI response while preserving structure"""
    text = re.sub(r"^(\s*)[*•]\s+", r"\1- ", text, flags=re.MULTILINE)
    text = re.sub(r"^#+\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"[*_`]", "", text)
    return text.strip()

@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        # Get text inputs
        user_message = request.form.get("message", "")
        prompt = request.form.get("prompt", "")
        
        # Process images
        image_parts = []
        for file_key in request.files:
            file = request.files[file_key]
            if file.filename == '' or not file.content_type.startswith('image/'):
                continue
            
            # Convert to Part
            image_bytes = file.read()
            image_part = types.Part.from_bytes(
                data=image_bytes,
                mime_type=file.mimetype
            )
            image_parts.append(image_part)
            file.close()  # Important to close file handles

        # Build contents
        contents = []
        if user_message:
            contents.append(user_message)
        if prompt:
            contents.append(prompt)
        contents.extend(image_parts)

        response = client.models.generate_content(
            model=os.getenv("GEN_AI_MODEL_NAME"),
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction="You are TravelBuddy, an AI that only answers travel-related questions. If the question is not about travel, politely decline to answer.",
                response_mime_type="text/plain"
            )
        )

        ai_response = clean_ai_response(response.text) if response.text else "Sorry, I couldn't process that."
        return jsonify({"response": ai_response})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=8080, host="0.0.0.0")