import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const res = await fetch(`${process.env.PY_BACKEND_URL}/generate/create_job`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}
