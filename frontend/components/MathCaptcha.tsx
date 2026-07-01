"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCaptcha } from "@/lib/api";

type CaptchaValue = { token: string; answer: string };

/**
 * Lightweight self-hosted anti-bot check: the API issues a signed "a + b"
 * challenge, the visitor types the sum, and we hand the parent both the opaque
 * token and the answer. No third-party script, no Cloudflare config — just
 * enough friction to deter naive spam bots (paired with the form honeypot and
 * server-side rate limiting).
 */
export function MathCaptcha({ onChange }: { onChange: (v: CaptchaValue) => void }) {
  const cb = useRef(onChange);
  cb.current = onChange;

  const [question, setQuestion] = useState("");
  const [token, setToken] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    setAnswer("");
    cb.current({ token: "", answer: "" });
    try {
      const c = await getCaptcha();
      setQuestion(c.question);
      setToken(c.token);
    } catch {
      setFailed(true);
      setQuestion("");
      setToken("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleInput(v: string) {
    const cleaned = v.replace(/[^\d]/g, "").slice(0, 3);
    setAnswer(cleaned);
    cb.current({ token, answer: cleaned });
  }

  // Split "a + b" so each operand can be coloured distinctly.
  const [a, b] = question.split("+").map((s) => s.trim());

  return (
    <div>
      <span className="field-label">Xác thực chống robot</span>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 rounded-brand border border-accent/45 bg-gradient-to-br from-bg-elev to-bg-deep px-4 py-2.5 shadow-[0_0_0_1px_rgba(0,0,0,0.15)]">
          {loading ? (
            <span className="font-serif text-xl text-ink-muted">…</span>
          ) : failed ? (
            <span className="font-serif text-xl text-accent">—</span>
          ) : (
            <>
              <span className="font-serif text-2xl font-bold tabular-nums text-accent drop-shadow">{a}</span>
              <span className="font-serif text-xl font-semibold text-emerald-300">+</span>
              <span className="font-serif text-2xl font-bold tabular-nums text-accent drop-shadow">{b}</span>
            </>
          )}
          <span className="font-serif text-xl font-semibold text-ink/80">=</span>
          <input
            type="text"
            inputMode="numeric"
            aria-label={`Nhập kết quả của ${question}`}
            placeholder="?"
            className="w-16 rounded-lg border-2 border-accent bg-cream-elev px-2 py-1.5 text-center text-xl font-extrabold tabular-nums text-cream-ink shadow-inner outline-none transition-shadow placeholder:font-normal placeholder:text-cream-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/60"
            value={answer}
            onChange={(e) => handleInput(e.target.value)}
            disabled={loading || failed}
            autoComplete="off"
          />
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-full border border-accent/40 p-2 text-accent transition-colors hover:bg-accent hover:text-bg-base"
          aria-label="Đổi câu hỏi khác"
          title="Đổi câu hỏi khác"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <path d="M21 3v6h-6" />
          </svg>
        </button>
      </div>
      {failed && (
        <p className="mt-1 text-xs text-accent">
          Không tải được câu hỏi xác thực. Vui lòng bấm nút làm mới.
        </p>
      )}
    </div>
  );
}
