MailboxIQ – Prompt-Driven Email Productivity Agent

MailboxIQ is an intelligent, prompt-driven Email Productivity Agent that processes a mock inbox and performs automated tasks such as:

Email categorization

Action-item extraction

Auto-drafting replies

Chat-based email interaction (Summaries, tasks, replies)

Dynamic prompt editing via a “Prompt Brain”

The system uses user-defined prompts to steer all AI operations.
Built with Flask (backend) + React (frontend).

-->Features
1. Email Processing

Load a mock inbox (12 sample emails)

Automatic categorization

Extract tasks with deadlines

Chat-based agent: summarize emails, extract info, ask follow-ups

Generate structured reply drafts (never sent automatically)

 2.Prompt-Driven Architecture

User can edit:

Categorization prompt

Action-item extraction prompt

Auto-reply prompt

All LLM responses follow saved prompt templates

3. UI (React)

Inbox viewer

Email detail view

Agent buttons (Summarize / Tasks / Generate Draft)

Prompt Brain panel

Mobile responsive

4. Safety & Robustness

Graceful error handling

Drafts stored locally (not sent)

Clear separation of concerns (UI, backend, LLM service, storage)

📁 Project Structure
MAILBOXIQ/
│
├── backend/
│   ├── app.py
│   ├── storage.py
│   ├── llm_service.py
│   ├── utils.py
│   ├── requirements.txt
│   ├── storage_files/
│   │   ├── inbox.json
│   │   ├── prompts.json
│   │   ├── processed.json
│   │   ├── drafts.json
│   └── README_BACKEND.md
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── utils/api.js
    │   ├── components/EmailView.jsx
    │   ├── components/PromptBrain.jsx
    │   └── ...
    ├── public/logo.png
    ├── index.html
    └── package.json

🛠️ Setup Instructions
1️⃣ Clone the Repository
git clone <your-repo-link>
cd MAILBOXIQ

🖥️ Backend Setup (Flask)
1. Create and activate virtual environment
cd backend
python -m venv venv
source venv/bin/activate   # macOS/Linux
venv\Scripts\activate      # Windows

2. Install dependencies
pip install -r requirements.txt

3. Add environment variables

Create .env inside backend/:

GEMINI_API_KEY=your_key_here

4. Start Flask server
python app.py


➡ Backend runs at: http://localhost:5000

🎨 Frontend Setup (React)
1. Install packages
cd frontend
npm install

2. Start development server
npm run dev


➡ Frontend runs at: http://localhost:5173
 (or whichever port Vite chooses)

📬 How to Load the Mock Inbox

MailboxIQ ships with a mock inbox (storage_files/inbox.json) containing 12 realistic sample emails.

Use this endpoint (called automatically by UI):

POST http://localhost:5000/inbox/load


Or click "Load Inbox" button inside the UI.

After loading:

/inbox returns the raw mock inbox

/processed returns categorized + extracted results after ingestion

🧠 How to Configure Prompts (Prompt Brain)

Open the Prompt Brain panel in the UI.

You can edit:

Categorization Prompt

Action Item Extraction Prompt

Auto Reply Prompt

When you click Save, prompts are stored in:

backend/storage_files/prompts.json


These prompts dynamically affect:

Ingestion

Categorization

Action extraction

Draft generation

Email agent chat

Fully prompt-driven behavior.

🧪 Usage Examples
1️⃣ Summarize an Email

Open an email → click Summarize.
Agent reads your prompt + email → returns a concise summary.

2️⃣ Extract Action Items

Click What tasks?
Returns structured JSON:

[
  { "task": "Prepare demo module", "deadline": "2025-11-15" }
]

3️⃣ Generate Reply Draft

Click Generate Draft
Agent uses your Auto-Reply Prompt and produces:

{
  "subject": "Re: Meeting Request",
  "body": "Hi, thanks for reaching out...",
  "suggested_followups": ["Ask for agenda"]
}


Draft is saved safely in drafts.json.

4️⃣ Change Prompts → Behavior Changes Immediately

Example:

Old categorization prompt

Categorize as Important or Spam only.


New prompt

Categorize into: Urgent, To-Do, FYI.


➡ Re-ingest inbox and categories instantly change.





🙌 Thank You

This project demonstrates a fully operational prompt-driven AI-based email agent with clean architecture, LLM integration, strong UX, and safe draft-only behavior.
