import os
import json
import re
import google.generativeai as genai

GEMINI_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)

class LLMService:
    def __init__(self, storage):
        self.storage = storage
        self.use_llm = GEMINI_KEY is not None
        if self.use_llm:
            self.model = genai.GenerativeModel("gemini-1.5-flash")

    # -----------------------------
    # 1. CATEGORIZATION
    # -----------------------------
    def categorize(self, email, prompt_text):
        if self.use_llm:
            try:
                prompt = f"""
{prompt_text}

Email:
Subject: {email.get("subject", "")}
Body: {email.get("body", "")}

Respond with ONLY ONE WORD category.
"""
                response = self.model.generate_content(prompt)
                content = response.text.strip().split()[0]
                return content
            except:
                pass

        # ---- fallback heuristic ----
        text = (email["subject"] + " " + email["body"]).lower()
        if "newsletter" in text:
            return "Newsletter"
        if "prize" in text or "click" in text:
            return "Spam"
        if "please" in text or "urgent" in text or "due" in text:
            return "To-Do"
        return "Important"

    # -----------------------------
    # 2. ACTION ITEM EXTRACTION
    # -----------------------------
    def extract_actions(self, email, prompt_text):
        if self.use_llm:
            try:
                prompt = f"""
{prompt_text}

Email:
{email.get("body", "")}

Return ONLY valid JSON array:
[{{"task":"...","deadline":"YYYY-MM-DD or null"}}]
"""
                response = self.model.generate_content(prompt)
                text = response.text

                json_match = re.search(r"\[.*\]", text, re.S)
                if json_match:
                    return json.loads(json_match.group(0))

            except:
                pass

        # fallback heuristic
        body = email.get("body", "")
        tasks = []
        for line in body.split("."):
            if any(k in line.lower() for k in ["please", "can you", "deadline", "by"]):
                tasks.append({"task": line.strip(), "deadline": None})
        return tasks

    # -----------------------------
    # 3. AGENT CHAT / DRAFTING
    # -----------------------------
    def agent_query(self, email, instruction, tone):
        if self.use_llm:
            try:
                prompts = self.storage.read_json("prompts.json")
                system_prompt = prompts.get("agent_system", "")

                email_text = f"""
Email:
Subject: {email.get("subject","")}
From: {email.get("sender","")}
Body:
{email.get("body","")}
""" if email else "No email selected."

                prompt = f"""
{system_prompt}

Task: {instruction}
Tone: {tone}

{email_text}
"""

                response = self.model.generate_content(prompt)
                return response.text.strip()

            except:
                pass

        # fallback
        if not email:
            return "No email selected."

        if "summar" in instruction.lower():
            return email.get("body","")[:200]

        if "task" in instruction.lower():
            return self.extract_actions(email, "")

        if "draft" in instruction.lower() or "reply" in instruction.lower():
            return {
                "subject": f"Re: {email['subject']}",
                "body": "Hi,\n\nThanks for the email. Will check and get back.\n\nRegards,",
                "suggested_followups": []
            }

        return "I can summarize, extract tasks, or write drafts."
