import { getToken, clearAuth } from "./auth";

export async function authFetch(input, init = {}) {
  const headers = new Headers(init.headers || {});
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(input, { ...init, headers });
  if (res.status === 401 || res.status === 403) {
    clearAuth();
  }
  return res;
}

export async function authJson(input, init = {}) {
  const res = await authFetch(input, init);
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}
