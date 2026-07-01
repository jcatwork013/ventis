"use client";

import { useState } from "react";
import { AuthError, changePassword, type Admin } from "@/lib/adminClient";
import { Toast } from "@/components/Toast";

export function AccountPanel({ me, onAuthError }: { me: Admin | null; onAuthError: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (next.length < 8) {
      setMsg({ kind: "err", text: "Mật khẩu mới phải có ít nhất 8 ký tự." });
      return;
    }
    if (next !== confirm) {
      setMsg({ kind: "err", text: "Xác nhận mật khẩu không khớp." });
      return;
    }
    setBusy(true);
    try {
      await changePassword(current, next);
      setMsg({ kind: "ok", text: "Đã đổi mật khẩu thành công." });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      if (err instanceof AuthError) onAuthError();
      else setMsg({ kind: "err", text: err instanceof Error ? err.message : "Đổi mật khẩu thất bại." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-medium text-ink">Tài khoản</h1>
        <p className="mt-1 text-sm text-ink-muted">Thông tin đăng nhập và bảo mật.</p>
      </div>

      {me && (
        <section className="rounded-brand border border-line bg-bg-elev/40 p-6 md:p-8">
          <h2 className="mb-5 font-serif text-2xl font-medium text-ink">Thông tin</h2>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="field-label">Tên</dt>
              <dd className="text-ink">{me.name || "—"}</dd>
            </div>
            <div>
              <dt className="field-label">Email</dt>
              <dd className="text-ink">{me.email}</dd>
            </div>
            <div>
              <dt className="field-label">Vai trò</dt>
              <dd className="text-ink">{me.role === "master" ? "Quản trị tối cao" : me.role}</dd>
            </div>
          </dl>
        </section>
      )}

      <section className="rounded-brand border border-line bg-bg-elev/40 p-6 md:p-8">
        <h2 className="mb-5 font-serif text-2xl font-medium text-ink">Đổi mật khẩu</h2>
        <form onSubmit={onSubmit} className="max-w-md space-y-5">
          <label className="block">
            <span className="field-label">Mật khẩu hiện tại</span>
            <input type="password" autoComplete="current-password" className="field-input" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </label>
          <label className="block">
            <span className="field-label">Mật khẩu mới (tối thiểu 8 ký tự)</span>
            <input type="password" autoComplete="new-password" className="field-input" value={next} onChange={(e) => setNext(e.target.value)} />
          </label>
          <label className="block">
            <span className="field-label">Xác nhận mật khẩu mới</span>
            <input type="password" autoComplete="new-password" className="field-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </label>

          {msg && <Toast kind={msg.kind}>{msg.text}</Toast>}

          <button type="submit" className="btn-primary" disabled={busy || !current || !next}>
            {busy ? "Đang lưu…" : "Đổi mật khẩu"}
          </button>
        </form>
      </section>
    </div>
  );
}
