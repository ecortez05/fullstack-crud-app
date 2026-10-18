import { useState } from "react";
import { api } from "../api.js";

export default function AuthForm({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = isLogin
        ? await api.login({ email: form.email, password: form.password })
        : await api.register(form);
      onAuth(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel auth" onSubmit={submit}>
      <h1>{isLogin ? "Log in" : "Create an account"}</h1>
      {!isLogin && <input placeholder="Name" value={form.name} onChange={update("name")} required />}
      <input type="email" placeholder="Email" value={form.email} onChange={update("email")} required />
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={update("password")}
        minLength={isLogin ? undefined : 8}
        required
      />
      {error && <p className="error">{error}</p>}
      <button disabled={busy}>{isLogin ? "Log in" : "Sign up"}</button>
      <button type="button" className="ghost" onClick={() => { setIsLogin(!isLogin); setError(""); }}>
        {isLogin ? "No account? Sign up" : "Already registered? Log in"}
      </button>
    </form>
  );
}
