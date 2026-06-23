import Constants from "expo-constants";
import { getToken } from "./tokenStorage";

const API_BASE_URL: string =
    Constants.expoConfig?.extra?.apiBaseUrl ?? "http://localhost:4000";

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

function resolveUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(resolveUrl(path), {
    headers: await authHeaders()
  });

  if (!response.ok) {
    throw new ApiError(`Request failed: ${response.status}`, response.status);
  }

  return response.json() as Promise<T>;
}

export async function apiPost<T>(
  path: string,
  body: unknown
): Promise<T> {
  const response = await fetch(resolveUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders())
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new ApiError(`Request failed: ${response.status}`, response.status);
  }

  return response.json() as Promise<T>;
}

export function getApiBaseUrl(): string {
    return API_BASE_URL;
}