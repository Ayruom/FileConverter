import os
import asyncio

import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routers import convert
from services.cleanup import run_periodic_cleanup
from utils.rate_limit import check_rate_limit, close_rate_limiter, _env_bool, rate_limiter, RATE_LIMIT_BACKEND

if os.getenv("SENTRY_DSN"):
    sentry_sdk.init(dsn=os.getenv("SENTRY_DSN"), traces_sample_rate=0.05)

app = FastAPI(title="All Files Convertor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "https://allfilesconvertor.com")],
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)

app.include_router(convert.router)


def _is_production() -> bool:
    return os.getenv("APP_ENV", os.getenv("ENV", "")).strip().lower() in {"prod", "production"}


def _validate_production_config():
    if not _is_production():
        return

    errors: list[str] = []
    frontend_url = os.getenv("FRONTEND_URL", "")
    if not frontend_url.startswith("https://"):
        errors.append("FRONTEND_URL must be an https:// origin in production")
    if RATE_LIMIT_BACKEND != "redis":
        errors.append("RATE_LIMIT_BACKEND=redis is required in production")
    if os.getenv("TEMP_STORAGE", "local") == "local" and os.getenv("ACK_SINGLE_INSTANCE_LOCAL_STORAGE") != "true":
        errors.append("Set ACK_SINGLE_INSTANCE_LOCAL_STORAGE=true or configure shared storage before production launch")
    if _env_bool("TRUST_PROXY_HEADERS") and os.getenv("TRUSTED_PROXY_BOUNDARY") != "true":
        errors.append("Set TRUSTED_PROXY_BOUNDARY=true when enabling TRUST_PROXY_HEADERS in production")
    if errors:
        raise RuntimeError("Unsafe production configuration: " + "; ".join(errors))


@app.on_event("startup")
async def start_periodic_cleanup():
    _validate_production_config()
    app.state.cleanup_stop_event = asyncio.Event()
    app.state.cleanup_task = asyncio.create_task(run_periodic_cleanup(convert.jobs, app.state.cleanup_stop_event))


@app.on_event("shutdown")
async def stop_periodic_cleanup():
    cleanup_stop_event = getattr(app.state, "cleanup_stop_event", None)
    cleanup_task = getattr(app.state, "cleanup_task", None)
    if cleanup_stop_event:
        cleanup_stop_event.set()
    if cleanup_task:
        await cleanup_task
    await close_rate_limiter()


@app.middleware("http")
async def apply_rate_limit(request: Request, call_next):
    if request.url.path == "/health" or not _env_bool("RATE_LIMIT_ENABLED", "true") or not rate_limiter.enabled:
        return await call_next(request)

    client_id = rate_limiter.identify(request)
    allowed, retry_after = await check_rate_limit(client_id)
    if not allowed:
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Please wait a moment and try again."},
            headers={"Retry-After": str(retry_after)},
        )

    return await call_next(request)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/formats")
def formats():
    from services.converter import SUPPORTED_CONVERSIONS

    return {"conversions": SUPPORTED_CONVERSIONS}
