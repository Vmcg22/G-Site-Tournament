from fastapi import WebSocket
from collections import defaultdict
import json
import uuid


class UUIDEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, uuid.UUID):
            return str(obj)
        return super().default(obj)


class ConnectionManager:
    """Manages WebSocket connections per tournament for real-time leaderboard updates."""

    def __init__(self):
        self.active: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, tournament_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active[tournament_id].append(websocket)

    def disconnect(self, tournament_id: str, websocket: WebSocket):
        self.active[tournament_id].remove(websocket)
        if not self.active[tournament_id]:
            del self.active[tournament_id]

    async def broadcast(self, tournament_id: str, data: dict):
        message = json.dumps(data, cls=UUIDEncoder)
        dead = []
        for ws in self.active.get(tournament_id, []):
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(tournament_id, ws)


manager = ConnectionManager()
