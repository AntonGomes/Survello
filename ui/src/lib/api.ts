const API_BASE_URL = process.env.PY_BACKEND_URL || "http://localhost:8000";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include", // Critical: sends the session_token cookie
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    // Try to parse error message from backend
    let errorMessage = "An error occurred";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = response.statusText;
    }
    throw new Error(errorMessage);
  }

  // Return null for 204 No Content, otherwise JSON
  if (response.status === 204) return null;
  return response.json();
}
