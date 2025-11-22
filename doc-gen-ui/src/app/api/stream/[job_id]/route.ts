import { NextRequest } from "next/server";

export const runtime = "nodejs"; // Required for streaming

export async function GET(
  req: NextRequest,
  { params }: { params: { job_id: string } }
) {
  const { job_id } = await params;

  const fastapi = await fetch(`http://localhost:8000/process/${job_id}`, {
    method: "GET",
  });

  if (!fastapi.ok || !fastapi.body) {
    return new Response("Failed to connect to FastAPI SSE endpoint", {
      status: 500,
    });
  }

  return fastapi;
}