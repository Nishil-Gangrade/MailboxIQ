from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from storage import Storage
from llm_service import LLMService
from dotenv import load_dotenv
load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
storage_dir = os.path.join(BASE_DIR, "storage_files")

app = Flask(__name__)
CORS(app)

# storage helper (reads/writes JSON files under backend/storage_files)
store = Storage(storage_dir)

# llm service (uses OPENAI_API_KEY if available; otherwise heuristics)
llm = LLMService(store)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

# ----- Inbox endpoints -----
@app.route("/inbox", methods=["GET"])
def get_inbox():
    inbox = store.read_json("inbox.json")
    return jsonify(inbox)

@app.route("/inbox/load", methods=["POST"])
def load_inbox():
    inbox = store.read_json("inbox.json")
    store.write_json("processed.json", [])
    return jsonify({"loaded": len(inbox), "inbox": inbox})

# ----- Prompts CRUD -----
@app.route("/prompts", methods=["GET"])
def get_prompts():
    prompts = store.read_json("prompts.json")
    return jsonify(prompts)

@app.route("/prompts", methods=["POST"])
def update_prompts():
    body = request.json or {}
    prompts = store.read_json("prompts.json")
    prompts.update(body)  
    store.write_json("prompts.json", prompts)
    return jsonify({"status": "ok", "prompts": prompts})

# ----- Ingestion endpoints -----
@app.route("/ingest", methods=["POST"])
def ingest_all():
    inbox = store.read_json("inbox.json")
    processed = []
    prompts = store.read_json("prompts.json")
    for email in inbox:
        category = llm.categorize(email, prompts.get("categorization", ""))
        action_items = llm.extract_actions(email, prompts.get("action_item", ""))
        entry = {
            "email_id": email.get("id"),
            "category": category,
            "action_items": action_items
        }
        processed.append(entry)
    store.write_json("processed.json", processed)
    return jsonify({"status": "ok", "processed_count": len(processed)})

@app.route("/ingest/<email_id>", methods=["POST"])
def ingest_one(email_id):
    inbox = store.read_json("inbox.json")
    prompts = store.read_json("prompts.json")
    email = next((e for e in inbox if str(e.get("id")) == str(email_id)), None)
    if not email:
        return jsonify({"error": "email not found"}), 404
    category = llm.categorize(email, prompts.get("categorization", ""))
    action_items = llm.extract_actions(email, prompts.get("action_item", ""))
    processed = store.read_json("processed.json")
    processed = [p for p in processed if str(p.get("email_id")) != str(email_id)]
    processed.append({"email_id": email_id, "category": category, "action_items": action_items})
    store.write_json("processed.json", processed)
    return jsonify({"status": "ok", "email_id": email_id, "category": category, "action_items": action_items})

# ----- Agent chat endpoint -----
@app.route("/agent/query", methods=["POST"])
def agent_query():
    """
    Body: { email_id: optional, instruction: str, tone: optional }
    The service will combine the stored prompts and email content to respond.
    """
    body = request.json or {}
    email_id = body.get("email_id")
    instruction = body.get("instruction", "")
    tone = body.get("tone", "neutral")

    inbox = store.read_json("inbox.json")
    email = None
    if email_id:
        email = next((e for e in inbox if str(e.get("id")) == str(email_id)), None)
    response = llm.agent_query(email, instruction, tone)
    return jsonify(response)


# ----- Drafts endpoints -----
@app.route("/drafts", methods=["GET"])
def get_drafts():
    drafts = store.read_json("drafts.json")
    return jsonify(drafts)

@app.route("/drafts", methods=["POST"])
def create_draft():
    body = request.json or {}
    drafts = store.read_json("drafts.json") or []
    draft = {
        "id": str(len(drafts) + 1),
        "email_id": body.get("email_id"),
        "subject": body.get("subject"),
        "body": body.get("body"),
        "suggested_followups": body.get("suggested_followups", []),
        "meta": body.get("meta", {}),
    }
    drafts.insert(0, draft)
    store.write_json("drafts.json", drafts)
    return jsonify({"status": "ok", "draft": draft})
@app.route("/drafts", methods=["PUT"])
def update_draft():
    body = request.json or {}
    drafts = store.read_json("drafts.json") or []

    updated = []
    for d in drafts:
        if d.get("id") == body.get("id"):
            d["subject"] = body.get("subject", d["subject"])
            d["body"] = body.get("body", d["body"])
        updated.append(d)

    store.write_json("drafts.json", updated)
    return jsonify({"status": "ok", "drafts": updated})


@app.route("/processed", methods=["GET"])
def get_processed():
    processed = store.read_json("processed.json")
    return jsonify(processed)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

