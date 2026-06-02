import { NextRequest, NextResponse } from "next/server";
import { getServerApiUrl } from "@/lib/server-api";

export async function POST(request: NextRequest) {
  const apiUrl = getServerApiUrl();
  const response = await fetch(`${apiUrl}/convert-batch`, {
    method: "POST",
    body: await request.formData()
  });

  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json",
      ...(response.headers.get("retry-after") ? { "retry-after": response.headers.get("retry-after") as string } : {})
    }
  });
}
