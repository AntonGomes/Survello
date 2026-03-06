import { client } from "@/client/client.gen";

export function configureClient() {
  const baseUrl = process.env.NEXT_PUBLIC_PY_BACKEND_URL || "http://localhost:8000";
  
  
  console.log("[API Config] Backend URL:", baseUrl);
  
  client.setConfig({
    baseUrl,
    credentials: "include",
  });
}
