"use client";

import type { InquiryStatus } from "@/lib/adminClient";

// Vietnamese label + badge styling for each inquiry status. Kept on the brand
// palette: gold accent for "new", muted tones for handled/archived states.
export const STATUS_META: Record<InquiryStatus, { label: string; badge: string }> = {
  new: { label: "Mới", badge: "border-accent/50 bg-accent/15 text-accent" },
  read: { label: "Đã đọc", badge: "border-line bg-bg-elev text-ink" },
  contacted: { label: "Đã liên hệ", badge: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" },
  archived: { label: "Lưu trữ", badge: "border-line bg-transparent text-ink-muted" },
};

export function StatusBadge({ status }: { status: InquiryStatus }) {
  const m = STATUS_META[status] ?? STATUS_META.new;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${m.badge}`}>
      {m.label}
    </span>
  );
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
