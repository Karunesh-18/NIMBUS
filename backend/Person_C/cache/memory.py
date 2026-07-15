import time
from typing import Any, Dict, Optional, Tuple

class MemoryCache:
    """
    A lightweight, thread-safe (implicit for GIL/dictionary operations) 
    in-memory cache utility with TTL support.
    """
    def __init__(self):
        self._cache: Dict[str, Tuple[Any, float]] = {}

    def get(self, key: str) -> Optional[Any]:
        if key not in self._cache:
            return None
        val, expiry = self._cache[key]
        if time.time() > expiry:
            del self._cache[key]
            return None
        return val

    def set(self, key: str, value: Any, ttl_seconds: float = 300.0) -> None:
        self._cache[key] = (value, time.time() + ttl_seconds)

    def delete(self, key: str) -> None:
        if key in self._cache:
            del self._cache[key]

    def clear(self) -> None:
        self._cache.clear()

cache = MemoryCache()
