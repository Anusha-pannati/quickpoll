from typing import Dict, Optional, Set
from fastapi import WebSocket
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for real-time updates."""

    def __init__(self) -> None:
        # Connections that subscribe to a specific poll
        self.poll_connections: Dict[int, Set[WebSocket]] = {}
        # Connections that subscribe to global updates (e.g. poll list page)
        self.global_connections: Set[WebSocket] = set()
        # Map each connection to its poll subscription (None for global)
        self.connection_map: Dict[WebSocket, Optional[int]] = {}

    async def connect(self, websocket: WebSocket, poll_id: Optional[int] = None) -> None:
        """Accept a new WebSocket connection."""
        await websocket.accept()

        self.connection_map[websocket] = poll_id

        if poll_id is None:
            self.global_connections.add(websocket)
        else:
            self.poll_connections.setdefault(poll_id, set()).add(websocket)

        self._log_state("Connected", poll_id)

    def disconnect(self, websocket: WebSocket, poll_id: Optional[int] = None) -> None:
        """Remove a WebSocket connection."""
        removed_poll_id = self._remove_connection(websocket)
        self._log_state("Disconnected", poll_id or removed_poll_id)

    async def send_personal_message(self, message: dict, websocket: WebSocket) -> None:
        """Send a message to a specific WebSocket."""
        try:
            await websocket.send_json(message)
        except Exception as exc:  # pragma: no cover - network errors
            logger.error("Error sending personal message: %s", exc)
            self._remove_connection(websocket)

    async def broadcast_to_poll(self, poll_id: int, message: dict, *, include_global: bool = True) -> None:
        """Broadcast a message to a poll audience (and optionally global listeners)."""
        targets = set(self.poll_connections.get(poll_id, set()))

        if include_global:
            targets.update(self.global_connections)

        await self._broadcast(targets, message, context=f"poll:{poll_id}")

    async def broadcast_to_all(self, message: dict) -> None:
        """Broadcast a message to every active connection."""
        await self._broadcast(set(self.connection_map.keys()), message, context="all")

    async def broadcast_to_global(self, message: dict) -> None:
        """Broadcast a message only to global listeners."""
        await self._broadcast(set(self.global_connections), message, context="global")

    async def _broadcast(self, connections: Set[WebSocket], message: dict, *, context: str) -> None:
        """Broadcast helper that gracefully cleans up stale connections."""
        if not connections:
            return

        disconnected: Set[WebSocket] = set()

        for connection in list(connections):
            try:
                await connection.send_json(message)
            except Exception as exc:  # pragma: no cover - network errors
                logger.error("Error broadcasting to %s: %s", context, exc)
                disconnected.add(connection)

        for connection in disconnected:
            removed_poll_id = self._remove_connection(connection)
            self._log_state("Cleaned up", removed_poll_id)

    def _remove_connection(self, websocket: WebSocket) -> Optional[int]:
        """Remove a connection from all tracking collections."""
        poll_id = self.connection_map.pop(websocket, None)

        if websocket in self.global_connections:
            self.global_connections.discard(websocket)

        if poll_id is not None:
            poll_set = self.poll_connections.get(poll_id)
            if poll_set and websocket in poll_set:
                poll_set.discard(websocket)
                if not poll_set:
                    del self.poll_connections[poll_id]

        return poll_id

    def _log_state(self, event: str, poll_id: Optional[int]) -> None:
        """Log current connection stats for observability."""
        total_poll_watchers = sum(len(connections) for connections in self.poll_connections.values())
        logger.info(
            "WebSocket %s. poll=%s | active=%s | global=%s | poll_watchers=%s",
            event,
            poll_id,
            len(self.connection_map),
            len(self.global_connections),
            total_poll_watchers,
        )


manager = ConnectionManager()