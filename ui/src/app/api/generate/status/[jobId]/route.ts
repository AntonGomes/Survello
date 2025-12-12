import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const res = await fetch(`${process.env.PY_BACKEND_URL}/generate/status/${jobId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  
  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}
