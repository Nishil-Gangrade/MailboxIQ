const API_BASE =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "https://mailboxiq-backend.onrender.com";

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

export const updateDraft = async (payload) => {
  const res = await fetch(`${API_BASE}/drafts`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
};
