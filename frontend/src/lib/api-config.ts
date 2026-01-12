import { client } from "@/client/client.gen";

export function configureClient() {
  client.setConfig({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    credentials: "include",
  });
}
