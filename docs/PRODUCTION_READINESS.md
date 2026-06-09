# All Files Convertor Production Readiness

This checklist covers the production-facing configuration that should be completed before deployment.

## Environment

- `NEXT_PUBLIC_SITE_URL` must be the canonical production site URL, for example `https://allfilesconvertor.com`.
- `FRONTEND_URL` must be the exact production origin for CORS.
- `NEXT_PUBLIC_API_URL` must point at the deployed API origin or internal proxy.
- `NEXT_PUBLIC_API_URL` must be HTTPS in production unless the web container reaches the API through a private internal network and `ALLOW_INTERNAL_API_HTTP=true` is set.
- `SENTRY_DSN` should be set for API errors.
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` should match the production domain when analytics are enabled.
- `NEXT_PUBLIC_ADSENSE_CLIENT` should only be set after the site is approved for ads.
- Start production configuration from `.env.production.example`, then replace the placeholder domains and secrets with deployment-specific values.

## Rate Limiting

Local development uses `RATE_LIMIT_BACKEND=memory`.

Production should use:

```env
RATE_LIMIT_ENABLED=true
RATE_LIMIT_BACKEND=redis
RATE_LIMIT_REQUESTS=30
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_RETENTION_HOURS=24
REDIS_URL=redis://...
```

Use Redis or Upstash so all API instances share the same counters. The Redis limiter stores a hashed IP key and request timestamps, then expires each key within the configured retention window.

Redis rate checks are performed atomically with a Lua script so concurrent requests cannot exceed the configured window.

Set `TRUST_PROXY_HEADERS=true` only when the API is behind a trusted proxy or CDN that controls `CF-Connecting-IP` or `X-Forwarded-For`.

## Storage

MVP/local mode can use `TEMP_STORAGE=local`, which writes files to the OS temp directory and relies on download cleanup plus periodic cleanup.

Production options:

- Single API instance: local ephemeral disk is acceptable if the host has enough temp storage and jobs do not move between instances.
- Multiple API instances: use shared object storage, such as S3-compatible storage, or route each job to the same instance until download.
- Large traffic: use S3-compatible storage with lifecycle policies and keep `TEMP_FILE_TTL_MINUTES` conservative.

The current job tracker is in memory, so run one API worker per container until job state is moved to Redis or a database.

When `APP_ENV=production`, the API refuses to start with local temp storage unless `ACK_SINGLE_INSTANCE_LOCAL_STORAGE=true` is set. This is an explicit acknowledgement that the deployment must use one API worker/container or sticky routing until shared job/result storage is implemented.

## Cleanup

Recommended defaults:

```env
CLEANUP_TTL_MINUTES=10
TEMP_FILE_TTL_MINUTES=60
CLEANUP_INTERVAL_SECONDS=300
```

Completed jobs are removed after the job TTL. Abandoned conversion temp folders are purged by the periodic cleanup loop.

## Observability

- Enable Sentry with `SENTRY_DSN`.
- Keep Sentry PII scrubbing enabled; do not attach uploaded file content or converted output to Sentry events.
- Track conversion failures by source format, target format, and sanitized filename only.
- Do not log file contents, raw uploads, or downloaded output.
- Monitor API CPU, memory, temp disk usage, Redis latency, and conversion duration.
- Add alerts for conversion failure spikes, cleanup failures, temp disk pressure, Redis latency, and API healthcheck failures.

## Security

- Terminate TLS at the reverse proxy, load balancer, or CDN and keep HSTS enabled by the web app or proxy.
- Keep `MAX_FILE_MB`, `MAX_BATCH_FILES`, `MAX_BATCH_MB`, and `MAX_OUTPUT_MB` set.
- Enforce request body limits at the CDN/reverse proxy before requests reach the API container.
- Keep MIME and extension checks enabled.
- API uploads are stream-read with hard byte limits even when the client omits `UploadFile.size`.
- HTML and SVG conversions reject external `http`, `https`, `ftp`, `file`, and `data` references before rendering.
- Keep filename sanitization enabled before writing output names.
- Run conversion workers as a non-root user.
- Keep LibreOffice and conversion libraries patched.
- Do not trust proxy IP headers unless the proxy boundary is controlled.
- Run converters in a network-restricted container or behind egress firewall rules for defense in depth.
- Keep CPU, memory, process, and request concurrency limits at the container/orchestrator layer. The Compose file includes baseline CPU, memory, and PID limits for web, API, and Redis.
- Put a CDN/WAF in front of the app; application rate limiting is not a DDoS boundary.

## Maintenance

- GitHub Actions runs Next lint/build, `npm audit --audit-level=high`, `pip-audit`, API regression tests, SBOM generation, and Trivy filesystem/config/secret/license scanning.
- Keep Docker images tagged immutably in production and roll back by redeploying the previous known-good image tag.
- Docker Compose includes API, Redis, and web services with healthchecks/restart policies. Keep the published ports bound to `127.0.0.1` and put HTTPS termination in front with a reverse proxy, load balancer, or CDN.
- Use an orchestrator, load balancer, or managed platform for rolling deploys and rollback. Compose restart policies improve recovery but are not zero-downtime deployment by themselves.
- Track the Next/PostCSS moderate advisory in dependency maintenance and upgrade as soon as the patched Next dependency tree is available.

## SEO Launch Checks

- Visit `/robots.txt` and confirm `/api/` is disallowed.
- Visit `/sitemap.xml` and confirm the homepage, legal pages, API docs, and conversion landing pages are listed.
- Confirm canonical URLs use `NEXT_PUBLIC_SITE_URL`.
- Confirm conversion pages do not claim unlimited usage beyond the configured service limits.
- Submit `/sitemap.xml` in Google Search Console after production DNS is live.
