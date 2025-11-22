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

        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel(self.model_id)
                self.use_llm = True
            except:
                self.use_llm = True
        else:
            self.use_llm = False

    def _extract_text(self, resp):
        if resp is None:
            return ""

        try:
            if hasattr(resp, "text") and isinstance(resp.text, str):
                return resp.text.strip()
        except:
            pass

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

    def _gemini_http(self, prompt):
        if not self.api_key:
            return None

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.http_model_path}"
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": self.api_key,
        }
        body = {"contents": [{"parts": [{"text": prompt}]}]}

        res = requests.post(url, json=body, headers=headers)
        if res.status_code != 200:
            print("Gemini HTTP Error:", res.text)
            return None

        try:
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
            except:
                text = self._gemini_http(prompt)

        if text:
            word = text.strip().split()[0].lower()
            if word in ["important", "newsletter", "spam"]:
                return word.capitalize()
            if word in ["todo", "to-do", "to_do"]:
                return "To-Do"

        t = (email.get("subject","") + " " + email.get("body","")).lower()
        if "newsletter" in t: return "Newsletter"
        if "prize" in t or "click" in t or "congrat" in t: return "Spam"
        if any(x in t for x in ["please", "urgent", "can you", "deadline"]): return "To-Do"
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
            except:
                text = self._gemini_http(prompt)

        if text:
            match = re.search(r"\[[\s\S]*\]", text)
            if match:
                try:
                    arr = json.loads(match.group(0))
                    cleaned = [{"task": x.get("task"), "deadline": x.get("deadline")} for x in arr]
                    return cleaned
                except:
                    pass

        tasks = []
        for line in re.split(r"[.\n]", email.get("body","")):
            if any(k in line.lower() for k in ["please", "can you", "deadline", "by "]):
                tasks.append({"task": line.strip(), "deadline": None})

        return tasks

    def agent_query(self, email, instruction, tone="neutral"):
        if not email:
            return {"type": "error", "response": "No email selected."}

        prompts = self.storage.read_json("prompts.json") or {}

        # SUMMARY
        if "summar" in instruction.lower():
            prompt = f"""{prompts.get("summarization", "Summarize:")}

Email:
{email['body']}

Summary:
"""
            text = None

            if self.use_llm:
                try:
                    resp = self.model.generate_content(prompt)
                    text = self._extract_text(resp)
                except:
                    text = self._gemini_http(prompt)

            text = str(text or email["body"])
            return {"status":"ok","type":"summary","response": text}

        # TASKS
        if "task" in instruction.lower():
            tasks = self.extract_actions(email, prompts.get("action_item", "Extract tasks"))
            formatted = "\n".join(f"- {t['task']}" for t in tasks)
            return {
                "status":"ok",
                "type":"tasks",
                "response": formatted,
                "data": tasks
            }

        # DRAFTS
        if "draft" in instruction.lower() or "reply" in instruction.lower():
            prompt = f"""{prompts.get("auto_reply", "Write a reply")}

Tone: {tone}

Email:
{email['body']}

Reply:
Subject:
Body:
"""

            text = None
            if self.use_llm:
                try:
                    resp = self.model.generate_content(prompt)
                    text = self._extract_text(resp)
                except:
                    text = self._gemini_http(prompt)

            text = text or ""
            subject = f"Re: {email['subject']}"
            body = text

            return {
                "status":"ok",
                "type":"draft",
                "response": {
                    "subject": subject,
                    "body": body
                }
            }

        # GENERIC INSTRUCTION
        prompt = f"""Instruction: {instruction}

Email:
{email['body']}

Answer:"""

        text = None
        if self.use_llm:
            try:
                resp = self.model.generate_content(prompt)
                text = self._extract_text(resp)
            except:
                text = self._gemini_http(prompt)

        return {"status":"ok","type":"custom","response": str(text or "")}
