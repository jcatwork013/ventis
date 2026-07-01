"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  AuthError,
  clearToken,
  fetchContent,
  fetchMe,
  isAuthed,
  listUploads,
  saveContent,
  uploadImage,
  type Admin,
} from "@/lib/adminClient";
import type { SiteContent } from "@/lib/content";
import { VentisMark, ArrowUpRight, Close } from "@/components/icons";
import { Toast } from "@/components/Toast";
import { InquiriesPanel } from "./inquiries";
import { Dashboard } from "./dashboard";
import { AccountPanel } from "./account";

/* ---------- small field primitives ---------- */

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input className="field-input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Area({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <textarea className="field-input resize-none" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function ImageField({
  label,
  value,
  onChange,
  allowEmpty,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  allowEmpty?: boolean;
  hint?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [gallery, setGallery] = useState(false);
  const [items, setItems] = useState<string[] | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Lỗi tải ảnh");
    } finally {
      setBusy(false);
      e.target.value = ""; // allow re-picking the same file after an error
    }
  }

  async function openGallery() {
    setGallery(true);
    setErr("");
    if (items === null) {
      try {
        setItems(await listUploads());
      } catch (e2) {
        setErr(e2 instanceof Error ? e2.message : "Không tải được thư viện ảnh.");
        setItems([]);
      }
    }
  }

  // When the field may be left empty, don't mask the empty state with a
  // fallback image — show a neutral placeholder so "no image" is visible.
  const previewSrc = value || (allowEmpty ? "" : "/hero-ventis.jpg");

  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="flex items-start gap-4">
        {previewSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewSrc} alt="" className="h-20 w-28 shrink-0 rounded-lg border border-line object-cover" />
        ) : (
          <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg border border-dashed border-line text-center text-[10px] uppercase tracking-[0.16em] text-ink-muted">
            Trống
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input className="field-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder="/đường-dẫn hoặc URL" />
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center rounded-full border border-accent/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-accent hover:bg-accent/10">
              {busy ? "Đang tải…" : "Tải ảnh lên"}
              <input type="file" accept="image/*" className="hidden" onChange={onPick} disabled={busy} />
            </label>
            <button
              type="button"
              onClick={openGallery}
              className="inline-flex items-center rounded-full border border-line px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted hover:text-accent"
            >
              Chọn từ thư viện
            </button>
            {allowEmpty && value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center rounded-full border border-line px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted hover:text-accent"
              >
                Xoá ảnh
              </button>
            )}
          </div>
          {hint && <p className="text-xs text-ink-muted">{hint}</p>}
          {err && <p className="text-xs text-accent">{err}</p>}
        </div>
      </div>

      {gallery && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-bg-deep/80 backdrop-blur-sm" onClick={() => setGallery(false)} />
          <div className="relative z-10 flex max-h-[80vh] w-full max-w-3xl flex-col rounded-brand border border-line bg-bg-elev p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-xl font-medium text-ink">Thư viện ảnh</h3>
              <button type="button" onClick={() => setGallery(false)} className="text-ink-muted hover:text-accent">
                <Close className="h-5 w-5" />
              </button>
            </div>
            {items === null ? (
              <p className="text-sm text-ink-muted">Đang tải…</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-ink-muted">Chưa có ảnh nào trong hệ thống. Hãy tải ảnh lên trước.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
                {items.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => {
                      onChange(url);
                      setGallery(false);
                    }}
                    className={`group relative aspect-[4/3] overflow-hidden rounded-lg border transition-colors ${
                      url === value ? "border-accent" : "border-line hover:border-accent/60"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-brand border border-line bg-bg-elev/40 p-6 md:p-8">
      <h2 className="mb-6 font-serif text-2xl font-medium text-ink">{title}</h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

/* ---------- page ---------- */

type Tab = "overview" | "content" | "inquiries" | "account";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Tổng quan" },
  { id: "content", label: "Nội dung website" },
  { id: "inquiries", label: "Liên hệ nhận được" },
  { id: "account", label: "Tài khoản" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [me, setMe] = useState<Admin | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [msg, setMsg] = useState("");

  const toLogin = useCallback(() => router.replace("/admin/login"), [router]);

  useEffect(() => {
    if (!isAuthed()) {
      toLogin();
      return;
    }
    fetchContent().then(setContent).catch(() => setContent(null));
    fetchMe().then(setMe).catch((e) => {
      if (e instanceof AuthError) toLogin();
    });
  }, [toLogin]);

  const set = useCallback(<K extends keyof SiteContent>(key: K, value: SiteContent[K]) => {
    setContent((c) => (c ? { ...c, [key]: value } : c));
  }, []);

  async function onSave() {
    if (!content) return;
    setStatus("saving");
    setMsg("");
    try {
      await saveContent(content);
      setStatus("saved");
      setMsg("Đã lưu. Làm mới trang chủ để xem thay đổi.");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (e) {
      setStatus("error");
      setMsg(e instanceof Error ? e.message : "Lưu thất bại.");
      if (e instanceof AuthError) toLogin();
    }
  }

  function logout() {
    clearToken();
    toLogin();
  }

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base text-ink-muted">Đang tải…</div>
    );
  }

  const c = content;

  return (
    <div className="min-h-screen bg-bg-base pb-24 text-ink">
      {msg && tab === "content" && <Toast kind={status === "error" ? "err" : "ok"}>{msg}</Toast>}
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-bg-base/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <VentisMark className="h-7 w-7 text-accent" />
            <span className="font-serif text-lg text-ink">VENTIS · Quản trị</span>
          </div>
          <div className="flex items-center gap-3">
            {me && <span className="hidden text-sm text-ink-muted md:inline">{me.name || me.email}</span>}
            <a href="/" target="_blank" className="hidden text-sm text-ink-muted hover:text-accent sm:inline">Xem trang ↗</a>
            {tab === "content" && (
              <button onClick={onSave} className="btn-primary !py-2" disabled={status === "saving"}>
                {status === "saving" ? "Đang lưu…" : "Lưu thay đổi"}
              </button>
            )}
            <button onClick={logout} className="text-sm text-ink-muted hover:text-accent">Đăng xuất</button>
          </div>
        </div>
        <div className="mx-auto flex max-w-5xl gap-6 overflow-x-auto px-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px whitespace-nowrap border-b-2 py-3 text-sm font-medium transition-colors ${
                tab === t.id ? "border-accent text-accent" : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-8 px-6 pt-8">
        {tab === "overview" && <Dashboard onAuthError={toLogin} onOpenInquiries={() => setTab("inquiries")} />}
        {tab === "account" && <AccountPanel me={me} onAuthError={toLogin} />}
        {tab === "inquiries" && <InquiriesPanel onAuthError={toLogin} />}
        {tab === "content" && (
          <>
            <Card title="Hero (đầu trang)">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Tiêu đề (vàng)" value={c.hero.titleTop} onChange={(v) => set("hero", { ...c.hero, titleTop: v })} />
                <Field label="Tiêu đề (trắng)" value={c.hero.titleBottom} onChange={(v) => set("hero", { ...c.hero, titleBottom: v })} />
              </div>
              <Field label="Từ khoá (phân cách bởi dấu phẩy)" value={c.hero.keywords.join(", ")} onChange={(v) => set("hero", { ...c.hero, keywords: v.split(",").map((s) => s.trim()).filter(Boolean) })} />
              <Field label="Tagline (chữ nghiêng)" value={c.hero.tagline} onChange={(v) => set("hero", { ...c.hero, tagline: v })} />
              <Area label="Mô tả" value={c.hero.intro} onChange={(v) => set("hero", { ...c.hero, intro: v })} />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nút phụ" value={c.hero.ctaGhost} onChange={(v) => set("hero", { ...c.hero, ctaGhost: v })} />
                <Field label="Nút chính" value={c.hero.ctaPrimary} onChange={(v) => set("hero", { ...c.hero, ctaPrimary: v })} />
              </div>
              <ImageField
                label="Ảnh nền hero (tuỳ chọn)"
                value={c.hero.image}
                onChange={(v) => set("hero", { ...c.hero, image: v })}
                allowEmpty
                hint="Có thể để trống — khi đó hero giữ nền tối mặc định, không dùng ảnh."
              />
            </Card>

            <Card title="Về Ventis">
              <Field label="Nhãn nhỏ" value={c.about.eyebrow} onChange={(v) => set("about", { ...c.about, eyebrow: v })} />
              <Field label="Tiêu đề (bọc [[..]] để tô vàng)" value={c.about.heading} onChange={(v) => set("about", { ...c.about, heading: v })} />
              <Area label="Trích dẫn" value={c.about.quote} onChange={(v) => set("about", { ...c.about, quote: v })} />
              <Field label="Nguồn trích dẫn" value={c.about.quoteAuthor} onChange={(v) => set("about", { ...c.about, quoteAuthor: v })} />
              <Area label="Đoạn 1" value={c.about.body1} onChange={(v) => set("about", { ...c.about, body1: v })} />
              <Area label="Đoạn 2" value={c.about.body2} onChange={(v) => set("about", { ...c.about, body2: v })} />
              <ListEditor
                label="Số liệu"
                rows={c.about.stats}
                cols={[{ key: "value", ph: "04" }, { key: "label", ph: "Lĩnh vực" }]}
                onChange={(stats) => set("about", { ...c.about, stats })}
                blank={{ value: "", label: "" }}
              />
            </Card>

            <Card title="Giá trị cốt lõi">
              <Field label="Nhãn nhỏ" value={c.values.eyebrow} onChange={(v) => set("values", { ...c.values, eyebrow: v })} />
              <ListEditor
                label="Giá trị"
                rows={c.values.items}
                cols={[
                  { key: "n", ph: "01" },
                  { key: "title", ph: "Vision" },
                  { key: "caption", ph: "Tầm nhìn dài hạn" },
                  { key: "icon", ph: "vision | expansion | innovation | leaf" },
                ]}
                onChange={(items) => set("values", { ...c.values, items })}
                blank={{ n: "", title: "", caption: "", icon: "vision" }}
              />
            </Card>

            <Card title="Lĩnh vực hoạt động">
              <Field label="Nhãn nhỏ" value={c.sectors.eyebrow} onChange={(v) => set("sectors", { ...c.sectors, eyebrow: v })} />
              <Field label="Tiêu đề" value={c.sectors.heading} onChange={(v) => set("sectors", { ...c.sectors, heading: v })} />
              <ListEditor
                label="Trụ cột"
                rows={c.sectors.items}
                cols={[{ key: "n", ph: "01" }, { key: "title", ph: "Investment" }, { key: "body", ph: "Mô tả", area: true }]}
                onChange={(items) => set("sectors", { ...c.sectors, items })}
                blank={{ n: "", title: "", body: "" }}
              />
            </Card>

            <Card title="Dự án & Cơ hội">
              <Field label="Nhãn nhỏ" value={c.projects.eyebrow} onChange={(v) => set("projects", { ...c.projects, eyebrow: v })} />
              <Field label="Tiêu đề" value={c.projects.heading} onChange={(v) => set("projects", { ...c.projects, heading: v })} />
              <div className="space-y-5">
                {c.projects.items.map((p, i) => (
                  <div key={i} className="rounded-lg border border-line p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.18em] text-ink-muted">Dự án {i + 1}</span>
                      <button className="text-ink-muted hover:text-accent" onClick={() => set("projects", { ...c.projects, items: c.projects.items.filter((_, j) => j !== i) })}>
                        <Close className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <Field label="Nhãn nhỏ" value={p.eyebrow} onChange={(v) => updateAt(c.projects.items, i, { eyebrow: v }, (items) => set("projects", { ...c.projects, items }))} />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Tên dự án" value={p.title} onChange={(v) => updateAt(c.projects.items, i, { title: v }, (items) => set("projects", { ...c.projects, items }))} />
                        <Field label="Địa điểm" value={p.location} onChange={(v) => updateAt(c.projects.items, i, { location: v }, (items) => set("projects", { ...c.projects, items }))} />
                      </div>
                      <ImageField label="Ảnh dự án" value={p.image} onChange={(v) => updateAt(c.projects.items, i, { image: v }, (items) => set("projects", { ...c.projects, items }))} />
                    </div>
                  </div>
                ))}
                <button className="btn-ghost" onClick={() => set("projects", { ...c.projects, items: [...c.projects.items, { image: "/project-phuquoc.jpg", eyebrow: "", title: "", location: "" }] })}>
                  + Thêm dự án
                </button>
              </div>
            </Card>

            <Card title="Đối tác">
              <Field label="Nhãn nhỏ" value={c.partners.eyebrow} onChange={(v) => set("partners", { ...c.partners, eyebrow: v })} />
              <Field label="Tiêu đề" value={c.partners.heading} onChange={(v) => set("partners", { ...c.partners, heading: v })} />
              <Area label="Mô tả" value={c.partners.body} onChange={(v) => set("partners", { ...c.partners, body: v })} />
              <Area label="Danh sách đối tác (mỗi dòng một mục)" rows={6} value={c.partners.items.join("\n")} onChange={(v) => set("partners", { ...c.partners, items: v.split("\n").map((s) => s.trim()).filter(Boolean) })} />
            </Card>

            <Card title="Liên hệ & Footer">
              <Field label="Nhãn nhỏ" value={c.contact.eyebrow} onChange={(v) => set("contact", { ...c.contact, eyebrow: v })} />
              <Field label="Tiêu đề" value={c.contact.heading} onChange={(v) => set("contact", { ...c.contact, heading: v })} />
              <Area label="Mô tả" value={c.contact.body} onChange={(v) => set("contact", { ...c.contact, body: v })} />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Email" value={c.contact.email} onChange={(v) => set("contact", { ...c.contact, email: v })} />
                <Field label="Hotline" value={c.contact.hotline} onChange={(v) => set("contact", { ...c.contact, hotline: v })} />
                <Field label="Website" value={c.contact.website} onChange={(v) => set("contact", { ...c.contact, website: v })} />
                <Field label="Địa chỉ" value={c.contact.address} onChange={(v) => set("contact", { ...c.contact, address: v })} />
              </div>
              <Field label="Dòng bản quyền (footer)" value={c.footer.copyright} onChange={(v) => set("footer", { ...c.footer, copyright: v })} />
            </Card>

            <div className="flex justify-end">
              <button onClick={onSave} className="btn-primary" disabled={status === "saving"}>
                {status === "saving" ? "Đang lưu…" : "Lưu tất cả thay đổi"}
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- generic list editor ---------- */

function updateAt<T>(arr: T[], i: number, patch: Partial<T>, done: (next: T[]) => void) {
  done(arr.map((row, j) => (j === i ? { ...row, ...patch } : row)));
}

type Col = { key: string; ph?: string; area?: boolean };

function ListEditor<T extends Record<string, string>>({
  label,
  rows,
  cols,
  onChange,
  blank,
}: {
  label: string;
  rows: T[];
  cols: Col[];
  onChange: (rows: T[]) => void;
  blank: T;
}) {
  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="rounded-lg border border-line p-3">
            <div className="mb-2 flex justify-end">
              <button className="text-ink-muted hover:text-accent" onClick={() => onChange(rows.filter((_, j) => j !== i))}>
                <Close className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {cols.map((col) =>
                col.area ? (
                  <textarea
                    key={col.key}
                    rows={2}
                    className="field-input resize-none sm:col-span-2"
                    placeholder={col.ph}
                    value={row[col.key] ?? ""}
                    onChange={(e) => onChange(rows.map((r, j) => (j === i ? { ...r, [col.key]: e.target.value } : r)))}
                  />
                ) : (
                  <input
                    key={col.key}
                    className="field-input"
                    placeholder={col.ph}
                    value={row[col.key] ?? ""}
                    onChange={(e) => onChange(rows.map((r, j) => (j === i ? { ...r, [col.key]: e.target.value } : r)))}
                  />
                ),
              )}
            </div>
          </div>
        ))}
        <button className="btn-ghost !py-2" onClick={() => onChange([...rows, { ...blank }])}>
          + Thêm
        </button>
      </div>
    </div>
  );
}
