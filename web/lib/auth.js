const TOKEN_KEY = "hotelbooking.token";
const USER_KEY = "hotelbooking.user";

export function saveAuth(data) {
  if (typeof window === "undefined") return;
  if (!data || !data.token) return;
  try {
    localStorage.setItem(TOKEN_KEY, data.token);
    const user = {
      userId: data.userId,
      email: data.email,
      name: data.name,
      role: data.role,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event("authchange"));
  } catch (err) {
    console.error("saveAuth failed", err);
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthed() {
  return !!getToken();
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("authchange"));
}

export function logout(router) {
  clearAuth();
  if (router && typeof router.push === "function") {
    router.push("/");
  }
}
