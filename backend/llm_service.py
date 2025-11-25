# llm_service.py — clean, stable, strict JSON output

import os
import json
import re
import requests
import google.generativeai as genai


class LLMService:
    def __init__(self, storage, model_choice="gemini-2.5-flash"):
        self.storage = storage
        self.api_key = os.getenv("GEMINI_API_KEY")

        self.use_llm = False
        self.model_id = f"models/{model_choice}"
        self.http_model_path = f"{self.model_id}:generateContent"

        # Try SDK
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel(self.model_id)
                self.use_llm = True
            except Exception:
                self.use_llm = True  # fallback to HTTP
        else:
            self.use_llm = False

  
    def _extract_text(self, resp):
        if resp is None:
            return ""

        # Gemini SDK response
        try:
            if hasattr(resp, "text") and isinstance(resp.text, str):
                return resp.text.strip()
        except:
            pass

        # HTTP JSON response
        if isinstance(resp, dict):
            try:
                cand = resp.get("candidates", [])
                if cand:
                    parts = cand[0]["content"]["parts"]
                    if parts and "text" in parts[0]:
                        return parts[0]["text"].strip()
            except:
                pass

        if isinstance(resp, str):
            return resp.strip()

        return str(resp)

    # HTTP fallback call to Gemini
    def _gemini_http(self, prompt):
        if not self.api_key:
            return None

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.http_model_path}"
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": self.api_key,
        }
        body = {"contents": [{"parts": [{"text": prompt}]}]}

        try:
            res = requests.post(url, json=body, headers=headers)
            if res.status_code != 200:
                print("Gemini HTTP Error:", res.text)
                return None
            return self._extract_text(res.json())
        except:
            return None

   
    def categorize(self, email, prompt_text):
        prompt = f"""{prompt_text}

Email:
Subject: {email.get('subject','')}
Body: {email.get('body','')}

Respond with ONLY ONE WORD category:
- Important
- To-Do
- Spam
- Newsletter
"""

        text = None

        if self.use_llm:
            try:
                resp = self.model.generate_content(prompt)
                text = self._extract_text(resp)
            except Exception:
                text = self._gemini_http(prompt)

        # Clean category mapping
        if text:
            word = text.strip().split()[0].lower()
            if word in ["important", "newsletter", "spam"]:
                return word.capitalize()
            if word in ["todo", "to-do", "to_do"]:
                return "To-Do"

        # Local heuristics fallback
        t = (email.get("subject", "") + " " + email.get("body", "")).lower()
        if "newsletter" in t:
            return "Newsletter"
        if any(x in t for x in ["prize", "click", "congrat"]):
            return "Spam"
        if any(x in t for x in ["please", "urgent", "can you", "deadline"]):
            return "To-Do"

        return "Important"

  
    def extract_actions(self, email, prompt_text):
        prompt = f"""{prompt_text}

Email:
{email['body']}

Return ONLY JSON:
[
  {{"task": "...", "deadline": "YYYY-MM-DD or null"}}
]
"""

        text = None

        if self.use_llm:
            try:
                resp = self.model.generate_content(prompt)
                text = self._extract_text(resp)
            except Exception:
                text = self._gemini_http(prompt)

        # Try extracting JSON
        if text:
            match = re.search(r"\[[\s\S]*?\]", text)
            if match:
                try:
                    arr = json.loads(match.group(0))
                    return [
                        {
                            "task": x.get("task"),
                            "deadline": x.get("deadline")
                        }
                        for x in arr
                    ]
                except:
                    pass

        # Heuristic fallback
        tasks = []
        for line in re.split(r"[.\n]", email.get("body", "")):
            if any(k in line.lower() for k in ["please", "can you", "deadline", "by "]):
                tasks.append({"task": line.strip(), "deadline": None})

        return tasks

    def agent_query(self, email, instruction, tone="neutral"):

        # GLOBAL INBOX QUERY (no email_id)
        if not email:
            inbox = self.storage.read_json("inbox.json") or []
            combined = "\n\n".join(
                f"Subject: {e['subject']}\nBody: {e['body']}"
                for e in inbox
            )

            prompt = f"""
Instruction: {instruction}

Inbox:
{combined}

Answer clearly in plain text.
"""

            text = None
            if self.use_llm:
                try:
                    resp = self.model.generate_content(prompt)
                    text = self._extract_text(resp)
                except:
                    text = self._gemini_http(prompt)

            return {"status": "ok", "type": "global", "response": text or ""}

        # ---- SUMMARY ----
        if "summar" in instruction.lower():
            prompt = f"Summarize:\n\n{email['body']}\n\nSummary:"
            text = None

            if self.use_llm:
                try:
                    resp = self.model.generate_content(prompt)
                    text = self._extract_text(resp)
                except:
                    text = self._gemini_http(prompt)

            return {"status": "ok", "type": "summary", "response": text or email["body"]}

        # ---- TASKS ----
        if "task" in instruction.lower():
            tasks = self.extract_actions(email, "Extract tasks")
            formatted = "\n".join(f"- {t['task']}" for t in tasks)
            return {
                "status": "ok",
                "type": "tasks",
                "response": formatted,
                "data": tasks
            }

        # ---- DRAFT REPLY ----
        if "draft" in instruction.lower() or "reply" in instruction.lower():
            prompt = f"Write a reply:\n\nEmail:\n{email['body']}\n\nReply:"
            text = None

            if self.use_llm:
                try:
                    resp = self.model.generate_content(prompt)
                    text = self._extract_text(resp)
                except:
                    text = self._gemini_http(prompt)

            return {
                "status": "ok",
                "type": "draft",
                "response": {
                    "subject": f"Re: {email['subject']}",
                    "body": text or ""
                }
            }

        # ---- CUSTOM ----
        prompt = f"Instruction: {instruction}\n\nEmail:\n{email['body']}\n\nAnswer:"
        text = None

        if self.use_llm:
            try:
                resp = self.model.generate_content(prompt)
                text = self._extract_text(resp)
            except:
                text = self._gemini_http(prompt)

        return {"status": "ok", "type": "custom", "response": text or ""}
