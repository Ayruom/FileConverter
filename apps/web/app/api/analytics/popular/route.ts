import { NextResponse } from "next/server";
import { getServerApiUrl } from "@/lib/server-api";

export async function GET() {
  const apiUrl = getServerApiUrl();
  const response = await fetch(`${apiUrl}/analytics/popular`, {
    cache: "no-store"
  });

  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json"
    }
  });
}
