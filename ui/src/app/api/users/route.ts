import { NextRequest } from "next/server";
import { auth0 } from "@/lib/auth0";
import { backendFetch } from "@/lib/backendFetch";

// /api/users/create/route.ts
export async function POST(req: NextRequest) {

    // validate user
    const session = await auth0.getSession();
    if (!session?.user) return new Response("Unauthorized", { status: 401 });
    
    const res = await backendFetch("/users/sync", {
      method: "POST",
      sub: session.user.sub,
      body: JSON.stringify({
        email: session.user.email,
        name: session.user.name,
      }),
    });
    
    return res;
  }
