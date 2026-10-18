import { useEffect, useState } from "react";
import { api, hasToken, setToken } from "./api.js";
import AuthForm from "./components/AuthForm.jsx";
import PostList from "./components/PostList.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(hasToken());

  useEffect(() => {
    if (hasToken()) {
      api.me().then((r) => setUser(r.user)).catch(() => {}).finally(() => setChecking(false));
    }
    const onLogout = () => setUser(null);
    window.addEventListener("logout", onLogout);
    return () => window.removeEventListener("logout", onLogout);
  }, []);

  function handleAuth({ token, user }) {
    setToken(token);
    setUser(user);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  if (checking) return <p className="center muted">Loading…</p>;
  if (!user) return <AuthForm onAuth={handleAuth} />;

  return (
    <div className="wrap">
      <header>
        <h1>My Posts</h1>
        <div>
          <span className="muted">{user.name}</span>
          <button className="ghost" onClick={logout}>Log out</button>
        </div>
      </header>
      <PostList />
    </div>
  );
}
