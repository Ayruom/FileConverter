import os
import time
from collections import deque
from dataclasses import dataclass, field
from hashlib import sha256

from fastapi import Request


def _env_bool(name: str, default: str = "false") -> bool:
    return os.getenv(name, default).strip().lower() in {"1", "true", "yes", "on"}


@dataclass
class ClientWindow:
    events: deque[float] = field(default_factory=deque)
    last_seen: float = field(default_factory=time.monotonic)


class IpRateLimiter:
    def __init__(
        self,
        requests: int,
        window_seconds: int,
        retention_hours: int,
        trust_proxy_headers: bool = False,
    ):
        self.requests = requests
        self.window_seconds = window_seconds
        self.retention_seconds = retention_hours * 60 * 60
        self.trust_proxy_headers = trust_proxy_headers
        self.clients: dict[str, ClientWindow] = {}
        self._last_purge = time.monotonic()

    @property
    def enabled(self) -> bool:
        return self.requests > 0 and self.window_seconds > 0

    def identify(self, request: Request) -> str:
        if self.trust_proxy_headers:
            cloudflare_ip = request.headers.get("cf-connecting-ip")
            forwarded_for = request.headers.get("x-forwarded-for")
            if cloudflare_ip:
                return cloudflare_ip.strip()
            if forwarded_for:
                return forwarded_for.split(",", maxsplit=1)[0].strip()

        if request.client and request.client.host:
            return request.client.host
        return "unknown"

    def check(self, client_id: str) -> tuple[bool, int]:
        now = time.monotonic()
        self._purge(now)

        client = self.clients.setdefault(client_id, ClientWindow())
        client.last_seen = now

        cutoff = now - self.window_seconds
        while client.events and client.events[0] <= cutoff:
            client.events.popleft()

        if len(client.events) >= self.requests:
            retry_after = max(1, int(self.window_seconds - (now - client.events[0])))
            return False, retry_after

        client.events.append(now)
        return True, 0

    def _purge(self, now: float):
        if now - self._last_purge < 60:
            return

        cutoff = now - self.retention_seconds
        expired = [client_id for client_id, client in self.clients.items() if client.last_seen <= cutoff]
        for client_id in expired:
            del self.clients[client_id]
        self._last_purge = now


class RedisIpRateLimiter:
    LUA_CHECK = """
local key = KEYS[1]
local now = tonumber(ARGV[1])
local cutoff = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local retention = tonumber(ARGV[4])
local member = ARGV[5]

redis.call("ZREMRANGEBYSCORE", key, 0, cutoff)
local count = redis.call("ZCARD", key)
if count >= limit then
  local oldest = redis.call("ZRANGE", key, 0, 0, "WITHSCORES")
  return {0, oldest[2] or now}
end

redis.call("ZADD", key, now, member)
redis.call("EXPIRE", key, retention)
return {1, 0}
"""

    def __init__(self, requests: int, window_seconds: int, retention_hours: int, redis_url: str):
        self.requests = requests
        self.window_seconds = window_seconds
        self.retention_seconds = retention_hours * 60 * 60
        self.redis_url = redis_url
        self._client = None

    @property
    def enabled(self) -> bool:
        return self.requests > 0 and self.window_seconds > 0

    async def check(self, client_id: str) -> tuple[bool, int]:
        client = await self._redis()
        now = time.time()
        key = f"all-files-convertor:rate:{sha256(client_id.encode('utf-8')).hexdigest()}"
        cutoff = now - self.window_seconds
        member = f"{now}:{os.urandom(4).hex()}"
        allowed, oldest_score = await client.eval(
            self.LUA_CHECK,
            1,
            key,
            now,
            cutoff,
            self.requests,
            self.retention_seconds,
            member,
        )

        if int(allowed) != 1:
            oldest_score = float(oldest_score or now)
            retry_after = max(1, int(self.window_seconds - (now - oldest_score)))
            return False, retry_after

        return True, 0

    async def close(self):
        if self._client is not None:
            await self._client.aclose()

    async def _redis(self):
        if self._client is None:
            from redis.asyncio import Redis

            self._client = Redis.from_url(self.redis_url, decode_responses=True)
        return self._client


RATE_LIMIT_BACKEND = os.getenv("RATE_LIMIT_BACKEND", "memory").lower()
RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "30"))
RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))
RATE_LIMIT_RETENTION_HOURS = int(os.getenv("RATE_LIMIT_RETENTION_HOURS", "24"))

rate_limiter = IpRateLimiter(
    requests=RATE_LIMIT_REQUESTS,
    window_seconds=RATE_LIMIT_WINDOW_SECONDS,
    retention_hours=RATE_LIMIT_RETENTION_HOURS,
    trust_proxy_headers=_env_bool("TRUST_PROXY_HEADERS"),
)

redis_rate_limiter = RedisIpRateLimiter(
    requests=RATE_LIMIT_REQUESTS,
    window_seconds=RATE_LIMIT_WINDOW_SECONDS,
    retention_hours=RATE_LIMIT_RETENTION_HOURS,
    redis_url=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
)


async def check_rate_limit(client_id: str) -> tuple[bool, int]:
    if RATE_LIMIT_BACKEND == "redis":
        return await redis_rate_limiter.check(client_id)
    return rate_limiter.check(client_id)


async def close_rate_limiter():
    await redis_rate_limiter.close()
