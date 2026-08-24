import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai


load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not set. Create a .env file in backend/ "
        "with GEMINI_API_KEY=your_key_here"
    )

genai.configure(api_key=GEMINI_API_KEY)

app = Flask(__name__)
CORS(app)  # connect with react fornt end 

MODEL_NAME =  "gemini-3.6-flash"

# different bot options for the user to choose from, each with a different tone and style of response
SYSTEM_PROMPTS = {
    "friendly": (
        "You are a warm, friendly, and encouraging assistant for GFix Digital, "
        "a software agency. Keep replies conversational and approachable, use "
        "simple language, and add a bit of personality. Keep answers concise "
        "unless the user asks for detail."
    ),
    "professional": (
        "You are a professional, polished assistant for GFix Digital, a "
        "software agency. Respond formally and precisely, avoid slang, and "
        "keep answers well-structured and business-appropriate."
    ),
    "technical": (
        "You are a technical assistant for GFix Digital, a software agency. "
        "Give precise, detail-oriented answers aimed at developers. Use "
        "code blocks and correct terminology where relevant, and don't "
        "oversimplify."
    ),
}
DEFAULT_PERSONALITY = "friendly"


def build_model(personality: str):
    """Create a GenerativeModel configured with the chosen system prompt."""
    system_prompt = SYSTEM_PROMPTS.get(personality, SYSTEM_PROMPTS[DEFAULT_PERSONALITY])
    return genai.GenerativeModel(
        model_name=MODEL_NAME,
        system_instruction=system_prompt,
    )


def to_gemini_history(history):
    """
    Convert the frontend's history format:
        [{ "role": "user" | "bot", "text": "..." }, ...]
    into the format Gemini's chat session expects:
        [{ "role": "user" | "model", "parts": ["..."] }, ...]
    """
    converted = []
    for item in history or []:
        role = item.get("role")
        text = item.get("text", "")
        if not text:
            continue
        gemini_role = "user" if role == "user" else "model"
        converted.append({"role": gemini_role, "parts": [text]})
    return converted


#routes
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    history = data.get("history", [])
    personality = data.get("personality", DEFAULT_PERSONALITY)

    if not message:
        return jsonify({"error": "message is required"}), 400

    try:
        model = build_model(personality)
        chat_session = model.start_chat(history=to_gemini_history(history))
        response = chat_session.send_message(message)
        reply_text = response.text
    except Exception as exc:  #  BLE001 - surface a clean error to the client
        app.logger.exception("Gemini request failed")
        return jsonify({"error": f"Failed to get a response from Gemini: {exc}"}), 502

    return jsonify({"reply": reply_text})


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
