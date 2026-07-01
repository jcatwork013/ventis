"use client";

import { useEffect, useState } from "react";
import { AuthError, fetchStats, INQUIRY_STATUSES, type Stats } from "@/lib/adminClient";
import { STATUS_META } from "./statusMeta";

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-brand border border-line bg-bg-elev/40 p-6">
      <div className={`font-serif text-4xl font-medium ${accent ? "text-accent" : "text-ink"}`}>{value}</div>
      <div className="mt-1 text-sm text-ink-muted">{label}</div>
    </div>
  );
}

export function Dashboard({ onAuthError, onOpenInquiries }: { onAuthError: () => void; onOpenInquiries: () => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch((e) => {
        if (e instanceof AuthError) onAuthError();
        else setErr(e instanceof Error ? e.message : "Lỗi tải thống kê.");
      });
  }, [onAuthError]);

  if (err) return <p className="text-accent">{err}</p>;
  if (!stats) return <p className="text-ink-muted">Đang tải…</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-medium text-ink">Tổng quan</h1>
        <p className="mt-1 text-sm text-ink-muted">Tình hình liên hệ khách hàng gửi về qua website.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Liên hệ mới chưa đọc" value={stats.by_status.new} accent />
        <StatCard label="Mới trong 7 ngày" value={stats.last_7_days} />
        <StatCard label="Đã liên hệ" value={stats.by_status.contacted} />
        <StatCard label="Tổng cộng" value={stats.total} />
      </div>

      <section className="rounded-brand border border-line bg-bg-elev/40 p-6 md:p-8">
        <h2 className="mb-5 font-serif text-2xl font-medium text-ink">Phân loại theo trạng thái</h2>
        <div className="space-y-3">
          {INQUIRY_STATUSES.map((s) => {
            const count = stats.by_status[s] ?? 0;
            const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
            return (
              <div key={s} className="flex items-center gap-4">
                <span className="w-24 shrink-0 text-sm text-ink-muted">{STATUS_META[s].label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-elev">
                  <div className="h-full rounded-full bg-accent/70" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-10 shrink-0 text-right text-sm tabular-nums text-ink">{count}</span>
              </div>
            );
          })}
        </div>
      </section>

      <button onClick={onOpenInquiries} className="btn-ghost">
        Xem danh sách liên hệ →
      </button>
    </div>
  );
}
