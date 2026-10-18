let token = localStorage.getItem("token");

export const hasToken = () => !!token;

export function setToken(value) {
  token = value;
  if (value) localStorage.setItem("token", value);
  else localStorage.removeItem("token");
}

async function request(path, { method = "GET", data } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (res.status === 204) return null;
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && token) {
      // token expired, send them back to the login screen
      setToken(null);
      window.dispatchEvent(new Event("logout"));
    }
    throw new Error(json.message || "Request failed");
  }
  return json;
}

export const api = {
  register: (data) => request("/auth/register", { method: "POST", data }),
  login: (data) => request("/auth/login", { method: "POST", data }),
  me: () => request("/auth/me"),
  listPosts: (params) => request(`/posts?${new URLSearchParams(params)}`),
  createPost: (data) => request("/posts", { method: "POST", data }),
  updatePost: (id, data) => request(`/posts/${id}`, { method: "PUT", data }),
  deletePost: (id) => request(`/posts/${id}`, { method: "DELETE" }),
};
