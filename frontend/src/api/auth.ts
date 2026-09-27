import { apiRequest, setAccessToken } from "./client";

export interface AuthRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  daily_energy_capacity: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export async function login(credentials: AuthRequest): Promise<TokenResponse> {
  const data = await apiRequest<TokenResponse>("/api/auth/login", {
    method: "POST",
    body: credentials,
  });
  setAccessToken(data.access_token);
  return data;
}

export function register(credentials: AuthRequest): Promise<User> {
  return apiRequest<User>("/api/auth/register", { method: "POST", body: credentials });
}

export async function refreshSession(): Promise<TokenResponse> {
  const data = await apiRequest<TokenResponse>("/api/auth/refresh", { method: "POST" });
  setAccessToken(data.access_token);
  return data;
}

export function getMe(): Promise<User> {
  return apiRequest<User>("/api/auth/me");
}

export async function logout(): Promise<void> {
  try {
    await apiRequest<void>("/api/auth/logout", { method: "POST" });
  } finally {
    setAccessToken(null);
  }
}