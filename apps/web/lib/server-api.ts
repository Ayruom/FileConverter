function isLocalApiUrl(url: URL) {
  return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
}

export function getServerApiUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const apiUrl = new URL(rawUrl);
  const isProduction = process.env.NODE_ENV === "production";
  const allowInternalHttp = process.env.ALLOW_INTERNAL_API_HTTP === "true";

  if (isProduction && apiUrl.protocol !== "https:" && !isLocalApiUrl(apiUrl) && !allowInternalHttp) {
    throw new Error("NEXT_PUBLIC_API_URL must be HTTPS in production unless ALLOW_INTERNAL_API_HTTP=true is set");
  }

  return apiUrl.toString().replace(/\/$/, "");
}
