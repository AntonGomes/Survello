import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { backendFetch } from "@/lib/backendFetch";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const session = await auth0.getSession();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { jobId } = await params;
  const res = await backendFetch(
    `/generate/download_url/${jobId}`,
    {
      sub: session.user.sub,
    }
  );
  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}
