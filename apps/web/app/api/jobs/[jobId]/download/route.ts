import { NextRequest, NextResponse } from "next/server";
import { getServerApiUrl } from "@/lib/server-api";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const apiUrl = getServerApiUrl();
  const { jobId } = await params;
  const response = await fetch(`${apiUrl}/jobs/${jobId}/download`, {
    cache: "no-store"
  });

  if (!response.ok) {
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "application/json"
      }
    });
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/octet-stream",
      "content-disposition": response.headers.get("content-disposition") ?? "attachment"
    }
  });
}
