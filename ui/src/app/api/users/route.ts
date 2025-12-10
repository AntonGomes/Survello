import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

// /api/users/create/route.ts
export async function POST(req: NextRequest) {
    const session = await auth0.getSession();
    if (!session?.user) return new Response("Unauthorized", { status: 401 });
    const externalId = session.user.sub; 
    const res = await fetch(`${process.env.PY_BACKEND_URL}/users/upsert/${externalId}`, {
      method: "PUT", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: session.user.email,
        name: session.user.name,
      }),
    });
    
    return res;
  }
