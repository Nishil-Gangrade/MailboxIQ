export const API = {
  loadInbox: () => fetch("/assets/mock_inbox.json").then((r) => r.json()),
};
