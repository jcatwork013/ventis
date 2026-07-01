"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AuthError,
  deleteInquiry,
  exportInquiries,
  fetchInquiries,
  INQUIRY_STATUSES,
  updateInquiry,
  type Inquiry,
  type InquiryQuery,
  type InquiryStatus,
} from "@/lib/adminClient";
import { Download, Search, Trash } from "@/components/icons";
import { STATUS_META, StatusBadge, formatDate } from "./statusMeta";

const LIMIT = 20;

export function InquiriesPanel({ onAuthError }: { onAuthError: () => void }) {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "">("");
  const [search, setSearch] = useState(""); // input box value
  const [query, setQuery] = useState(""); // applied search term
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [exporting, setExporting] = useState(false);

  const currentQuery: InquiryQuery = { page, limit: LIMIT, status: statusFilter, q: query };

  const load = useCallback(() => {
    setLoading(true);
    setErr("");
    fetchInquiries({ page, limit: LIMIT, status: statusFilter, q: query })
      .then((r) => {
        setItems(r.items);
        setTotal(r.total);
      })
      .catch((e) => {
        if (e instanceof AuthError) onAuthError();
        else setErr(e instanceof Error ? e.message : "Lỗi tải danh sách.");
      })
      .finally(() => setLoading(false));
  }, [page, statusFilter, query, onAuthError]);

  useEffect(load, [load]);

  // Patch one row in place after a status/notes update.
  function patchLocal(updated: Inquiry) {
    setItems((list) => list.map((it) => (it.id === updated.id ? updated : it)));
  }

  function removeLocal(id: string) {
    setItems((list) => list.filter((it) => it.id !== id));
    setTotal((t) => Math.max(0, t - 1));
  }

  async function onExport() {
    setExporting(true);
    try {
      await exportInquiries({ status: statusFilter, q: query });
    } catch (e) {
      if (e instanceof AuthError) onAuthError();
      else alert(e instanceof Error ? e.message : "Xuất CSV thất bại.");
    } finally {
      setExporting(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="space-y-6">
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={statusFilter === ""} onClick={() => { setStatusFilter(""); setPage(1); }}>
            Tất cả
          </FilterChip>
          {INQUIRY_STATUSES.map((s) => (
            <FilterChip key={s} active={statusFilter === s} onClick={() => { setStatusFilter(s); setPage(1); }}>
              {STATUS_META[s].label}
            </FilterChip>
          ))}
        </div>
        <button onClick={onExport} disabled={exporting} className="btn-ghost !py-2 inline-flex items-center gap-2">
          <Download className="h-4 w-4" />
          {exporting ? "Đang xuất…" : "Xuất CSV"}
        </button>
      </div>

      {/* search */}
      <form
        onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(search.trim()); }}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          className="field-input !pl-11"
          placeholder="Tìm theo tên, email, điện thoại, lời nhắn…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setSearch(""); setQuery(""); setPage(1); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink-muted hover:text-accent"
          >
            Xoá lọc
          </button>
        )}
      </form>

      {/* results */}
      {loading ? (
        <p className="text-ink-muted">Đang tải…</p>
      ) : err ? (
        <p className="text-accent">{err}</p>
      ) : items.length === 0 ? (
        <p className="text-ink-muted">{query || statusFilter ? "Không có liên hệ khớp bộ lọc." : "Chưa có liên hệ nào."}</p>
      ) : (
        <>
          <p className="text-sm text-ink-muted">{total} liên hệ{query || statusFilter ? " (đã lọc)" : ""}</p>
          <div className="space-y-4">
            {items.map((iq) => (
              <InquiryCard
                key={iq.id}
                iq={iq}
                onPatched={patchLocal}
                onRemoved={removeLocal}
                onAuthError={onAuthError}
              />
            ))}
          </div>

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <button className="btn-ghost !py-2 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                ← Trước
              </button>
              <span className="text-sm text-ink-muted">Trang {page}/{totalPages}</span>
              <button className="btn-ghost !py-2 disabled:opacity-40" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        active ? "border-accent bg-accent/10 text-accent" : "border-line text-ink-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function InquiryCard({
  iq,
  onPatched,
  onRemoved,
  onAuthError,
}: {
  iq: Inquiry;
  onPatched: (i: Inquiry) => void;
  onRemoved: (id: string) => void;
  onAuthError: () => void;
}) {
  const [notes, setNotes] = useState(iq.notes);
  const [busy, setBusy] = useState(false);
  const [rowErr, setRowErr] = useState("");
  const notesDirty = notes !== iq.notes;

  function handle<T>(p: Promise<T>, after: (v: T) => void) {
    setBusy(true);
    setRowErr("");
    p.then(after)
      .catch((e) => {
        if (e instanceof AuthError) onAuthError();
        else setRowErr(e instanceof Error ? e.message : "Thao tác thất bại.");
      })
      .finally(() => setBusy(false));
  }

  function changeStatus(status: InquiryStatus) {
    if (status === iq.status) return;
    handle(updateInquiry(iq.id, { status }), onPatched);
  }

  function saveNotes() {
    handle(updateInquiry(iq.id, { notes }), onPatched);
  }

  function remove() {
    if (!confirm(`Xoá liên hệ của "${iq.name}"? Hành động này không thể hoàn tác.`)) return;
    handle(deleteInquiry(iq.id), () => onRemoved(iq.id));
  }

  return (
    <div className="rounded-brand border border-line bg-bg-elev/40 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-serif text-xl text-ink">{iq.name}</h3>
            <StatusBadge status={iq.status} />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-muted">
            <a href={`mailto:${iq.email}`} className="hover:text-accent">{iq.email}</a>
            {iq.phone && <a href={`tel:${iq.phone}`} className="hover:text-accent">{iq.phone}</a>}
            {iq.budget_range && <span className="text-accent">{iq.budget_range}</span>}
          </div>
        </div>
        <span className="font-sans text-xs text-ink-muted">{formatDate(iq.created_at)}</span>
      </div>

      {iq.message && <p className="mt-4 whitespace-pre-wrap text-ink/90">{iq.message}</p>}

      {/* admin notes */}
      <div className="mt-4">
        <span className="field-label">Ghi chú nội bộ</span>
        <textarea
          className="field-input resize-none"
          rows={2}
          placeholder="Ví dụ: đã gọi 04/06, hẹn gửi báo giá tuần sau…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        {notesDirty && (
          <div className="mt-2 flex gap-3">
            <button onClick={saveNotes} disabled={busy} className="btn-primary !py-1.5 text-xs">Lưu ghi chú</button>
            <button onClick={() => setNotes(iq.notes)} className="text-xs text-ink-muted hover:text-accent">Hoàn tác</button>
          </div>
        )}
      </div>

      {/* actions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          Trạng thái:
          <select
            className="field-input !w-auto !py-1.5 text-sm"
            value={iq.status}
            disabled={busy}
            onChange={(e) => changeStatus(e.target.value as InquiryStatus)}
          >
            {INQUIRY_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_META[s].label}</option>
            ))}
          </select>
        </label>
        <button onClick={remove} disabled={busy} className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-red-400">
          <Trash className="h-4 w-4" /> Xoá
        </button>
      </div>
      {rowErr && <p className="mt-2 text-sm text-accent">{rowErr}</p>}
    </div>
  );
}
