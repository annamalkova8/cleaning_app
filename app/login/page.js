"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setStatus({ ok: true, message: data.message || "Ссылка отправлена, проверь почту." });
    } catch (err) {
      setStatus({ ok: false, message: "Что-то пошло не так. Попробуй ещё раз." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="login-card">
        <div className="display">🧹 Уборка</div>
        <p>Введи свой email — пришлём ссылку для входа</p>
        <form onSubmit={submit}>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="btn" disabled={loading} type="submit">
            {loading ? "Отправляем…" : "Получить ссылку"}
          </button>
        </form>
        {status && (
          <div className={`notice ${status.ok ? "" : "error"}`}>{status.message}</div>
        )}
      </div>
    </div>
  );
}
