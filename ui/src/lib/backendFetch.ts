import { signServiceToken } from "./serviceToken";

const PY_BACKEND_URL = process.env.PY_BACKEND_URL;
if (!PY_BACKEND_URL) throw new Error("Missing PY_BACKEND_URL");

type BackendFetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
  sub?: string; // who this call is on behalf of
};

export async function backendFetch(
  path: string,
  { sub = "system", headers, ...init }: BackendFetchOptions = {},
) {
  const token = signServiceToken(sub);

  const res = await fetch(`${PY_BACKEND_URL}${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(headers ?? {}),
    },
    cache: "no-store",
  });

  return res;
}