"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { login, isAuthed } from "@/lib/adminClient";
import { VentisMark, ArrowRight } from "@/components/icons";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthed()) router.replace("/admin");
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <VentisMark className="h-10 w-10 text-accent" />
          <h1 className="mt-5 font-serif text-3xl font-medium text-ink">Quản trị VENTIS</h1>
          <p className="mt-2 text-sm text-ink-muted">Đăng nhập để quản lý nội dung website.</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-brand border border-line bg-bg-elev/40 p-8"
          noValidate
        >
          <div className="mb-5">
            <label className="field-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="field-input"
              placeholder="admin@ventis.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="mb-6">
            <label className="field-label" htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              className="field-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <p className="mb-4 text-sm text-accent">{error}</p>}

          <button type="submit" className="group btn-primary w-full" disabled={loading}>
            {loading ? "Đang đăng nhập…" : "Đăng nhập"}
            {!loading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
          </button>
        </form>
      </div>
    </div>
  );
}
