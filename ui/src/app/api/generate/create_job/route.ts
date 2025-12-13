import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { backendFetch } from "@/lib/backendFetch";

export async function POST(req: NextRequest) {
  const session = await auth0.getSession();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const res = await backendFetch("/generate/create_job", {
    method: "POST",
    sub: session.user.sub,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}
