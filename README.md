
# Ai-chatbot
=======
# AI Chatbot — Gemini API + React Frontend

A full-stack AI chatbot: a Flask backend that talks to Google's Gemini API,
and a React + Tailwind CSS frontend for the chat UI.

Built for **GFix Digital**, a software agency assistant persona.

---

## Table of contents

1. [Folder structure](#1-folder-structure)
2. [Get a Gemini API key](#2-get-a-gemini-api-key)
3. [Backend setup (Flask)](#3-backend-setup-flask)
4. [Frontend setup (React + Tailwind)](#4-frontend-setup-react--tailwind)
5. [How it works](#5-how-it-works)
6. [Features implemented](#6-features-implemented)
7. [Push this project to GitHub](#7-push-this-project-to-github)

## 1. Folder structure
```
AI-chatbot/
  backend/
    app.py
    requirements.txt
    Procfile         <-- tells Railway/Render how to start the app in production
    .env             <-- you create this locally, never committed
    .env.example
  frontend/
    src/
      App.jsx
      main.jsx
      index.css
      components/
        ChatWindow.jsx
        MessageBubble.jsx
        InputBar.jsx
    index.html
    package.json
    vite.config.js
    tailwind.config.js
    postcss.config.js
    .env             <-- you create this locally, never committed
    .env.example
  README.md
  .gitignore
```

---

## 2. Get a Gemini API key

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with a Google account and click **Create API key**.
3. Copy the key — you'll paste it into `backend/.env` in the next step.

> Google periodically retires older Gemini model versions. If you ever see a
> `404 ... is no longer available` error, open `backend/app.py`, find the
> `MODEL_NAME = "..."` line near the top, and swap in whichever model name
> the error message recommends.

---

## 3. Backend setup (Flask)

### Windows (PowerShell)

```powershell
cd AI-chatbot\backend

# create and activate a virtual environment
python -m venv venv
venv\Scripts\Activate.ps1

# if PowerShell blocks the activation script, run this once then retry:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# install dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

# create your .env file
copy .env.example .env
notepad .env
```

### macOS / Linux

```bash
cd AI-chatbot/backend

python -m venv venv
source venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt

cp .env.example .env
```

In `.env`, paste your real key:

```
GEMINI_API_KEY=your_actual_key_here
PORT=5000
```

### Run the server

```bash
python app.py
```

You should see Flask running on `http://localhost:5000`. Confirm it's alive
(in a **second** terminal, backend left running in the first):

```bash
curl http://localhost:5000/health
# -> {"status": "ok"}
```

Test the chat endpoint directly:

```bash
curl -X POST http://localhost:5000/chat -H "Content-Type: application/json" -d "{\"message\": \"Hello, who are you?\", \"history\": []}"
```

(Or use Postman: POST to `http://localhost:5000/chat`, Headers →
`Content-Type: application/json`, Body → raw → JSON →
`{"message": "hello", "history": []}`.)

---

## 4. Frontend setup (React + Tailwind)

Open a **second terminal** (leave the backend running in the first):

```bash
cd AI-chatbot/frontend

# check Node is installed (v18+ recommended)
node --version
npm --version

# install dependencies
npm install

# create your local env file
cp .env.example .env        # Windows: copy .env.example .env
```

`frontend/.env` should point at your backend:

```
VITE_API_BASE_URL=http://localhost:5000
```

Run the dev server:

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`) in your browser.
Send a message — it should hit the Flask backend, call Gemini, and stream the
reply back into the chat window.

---

## 5. How it works

- The frontend keeps the **entire conversation** in React state
  (`App.jsx`), tagged with `role: "user" | "bot"`, `text`, and `timestamp`.
- On every send, it POSTs `{ message, history, personality }` to `/chat`.
  `history` is the conversation *so far* (not including the new message).
- The Flask backend converts that history into Gemini's expected format
  (`role: "user" | "model"`), starts a `chat_session` with a system prompt
  (personality), and sends the new message — so Gemini has full context
  every turn.
- The bot's reply is returned as `{ "reply": "..." }` and appended to state
  on the frontend, which triggers auto-scroll and re-render.

---

## 6. Features implemented

**Backend**
- `POST /chat` — accepts `message` + `history`, returns Gemini's reply
- `GET /health` — health check
- Gemini chat-session mode, used for full conversation context
- System prompt personas (Friendly / Professional / Technical)
- API key loaded from `.env`, never hardcoded
- `Procfile` + `gunicorn` for production deployment

**Frontend**
- Full-screen chat layout, message list + input bar
- User messages: right-aligned, coral. Bot messages: left-aligned, sage
- Animated typing indicator while waiting for a reply
- Auto-scroll to latest message
- Send on **Enter** (Shift+Enter for newline) or **Send** button
- **Clear chat** button
- Timestamp on every message
- Friendly error message if the API call fails
- Fully responsive (mobile-first Tailwind layout)
- Personality dropdown (Friendly / Professional / Technical)
- Copy-to-clipboard button on bot messages (appears on hover)
- Markdown rendering for bot replies via `react-markdown`
- Warm, rounded custom design (Tailwind, Quicksand + Nunito fonts)

---

## 7. Push this project to GitHub

```bash
cd AI-chatbot
git init
git add .
git commit -m "Initial commit"
```

Create a new **empty** repository on GitHub named `AI-chatbot` (no README,
no .gitignore — you already have both), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/AI-chatbot.git
git branch -M main
git push -u origin main
```

**Double-check secrets never get committed:**

```bash
git status
```

`backend/.env` and `frontend/.env` should **not** appear in the list of
tracked files — `.gitignore` already excludes them. If either one shows up,
stop and fix `.gitignore` before pushing.

---
## . Troubleshooting

| Problem | Fix |
|---|---|
| `GEMINI_API_KEY is not set` on backend start | Make sure `backend/.env` exists and has the key, and that you ran `python app.py` from inside `backend/` |
| `pip install -r requirements.txt` fails | Make sure your virtual environment is activated (prompt shows `(venv)`); try `python -m pip install --upgrade pip` first; recreate `requirements.txt` cleanly if it was typed by hand |
| `404 ... is not found for API version` or `... is no longer available` from Gemini | Google retired that model version. Open `backend/app.py`, update `MODEL_NAME` to the model name suggested in the error |
| Frontend shows "couldn't reach the assistant" on every send | Backend isn't running, or `VITE_API_BASE_URL` doesn't match the backend's actual URL/port. Restart the frontend after changing `.env` |
| CORS error in browser console | Confirm `flask-cors` is installed and `CORS(app)` is present in `app.py` |
| `429` or quota errors from Gemini | You've hit the free-tier rate limit — wait a bit or check your Google AI Studio usage dashboard |
| `npm error enoent ... package.json` | You're not inside the `frontend` folder, or the frontend files weren't copied there yet |
| Vercel deploy succeeds but chat fails | Double check `VITE_API_BASE_URL` on Vercel points to the live Railway URL (not `localhost`), and that the Railway backend is actually running |

---
