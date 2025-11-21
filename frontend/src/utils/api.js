export const API_BASE = "http://127.0.0.1:5000";

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  return res.json();
}

export async function apiPost(path, body = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

/* API functions */

export const loadInbox = () => apiGet("/inbox");

export const reloadInbox = () => apiPost("/inbox/load");

export const getPrompts = () => apiGet("/prompts");

export const savePrompts = (body) => apiPost("/prompts", body);

export const ingestAll = () => apiPost("/ingest");

export const ingestOne = (id) => apiPost(`/ingest/${id}`);

export const agentQuery = (payload) => apiPost("/agent/query", payload);

export const getDrafts = () => apiGet("/drafts");

export const createDraft = (payload) => apiPost("/drafts", payload);

export const getProcessed = () => apiGet("/processed");
