import os
import json
from threading import Lock

class Storage:
    def __init__(self, base_dir):
        self.base = base_dir
        self.lock = Lock()
        os.makedirs(self.base, exist_ok=True)

    def _path(self, filename):
        return os.path.join(self.base, filename)

    def read_json(self, filename):
        path = self._path(filename)
        if not os.path.exists(path):
            # if missing, return sensible default
            if filename.endswith(".json"):
                return [] if filename in ("processed.json", "drafts.json") else {}
        with open(path, "r", encoding="utf-8") as f:
            try:
                return json.load(f)
            except Exception:
                return []

    def write_json(self, filename, data):
        path = self._path(filename)
        with self.lock:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
