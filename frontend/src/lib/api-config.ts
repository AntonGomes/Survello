import { client } from "@/client/client.gen";

export function configureClient() {
  client.setConfig({
    baseUrl: "/py-api",
    credentials: "include",
  });
}
