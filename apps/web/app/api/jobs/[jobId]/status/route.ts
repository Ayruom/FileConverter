import { NextRequest, NextResponse } from "next/server";
import { getServerApiUrl } from "@/lib/server-api";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const apiUrl = getServerApiUrl();
  const { jobId } = await params;
  const response = await fetch(`${apiUrl}/jobs/${jobId}/status`, {
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
