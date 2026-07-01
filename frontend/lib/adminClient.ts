"use client";

import { DEFAULT_CONTENT, type SiteContent } from "./content";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const TOKEN_KEY = "ventis_admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

/** Decode the `exp` (seconds) from a JWT without verifying its signature. */
function tokenExp(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.exp === "number" ? json.exp : null;
  } catch {
    return null;
  }
}

/** True only when a token exists and has not expired. */
export function isAuthed(): boolean {
  const t = getToken();
  if (!t) return false;
  const exp = tokenExp(t);
  if (exp !== null && exp * 1000 <= Date.now()) {
    clearToken();
    return false;
  }
  return true;
}

async function parseError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    if (body?.error?.message) return body.error.message;
  } catch {
    /* ignore */
  }
  return fallback;
}

/** Thrown when the server rejects the session; callers redirect to /login. */
export class AuthError extends Error {}

/** Authenticated fetch that clears the token and throws AuthError on 401. */
async function authed(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { ...(init.headers ?? {}), Authorization: `Bearer ${getToken()}` },
    cache: "no-store",
  });
  if (res.status === 401) {
    clearToken();
    throw new AuthError("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
  }
  return res;
}

export type Admin = { email: string; name: string; role: string };

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${API}/api/v1/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await parseError(res, "Đăng nhập thất bại."));
  const json = await res.json();
  const token = json?.data?.token;
  if (!token) throw new Error("Không nhận được phiên đăng nhập.");
  setToken(token);
}

export async function fetchMe(): Promise<Admin> {
  const res = await authed(`/api/v1/admin/me`);
  if (!res.ok) throw new Error(await parseError(res, "Không tải được tài khoản."));
  return (await res.json())?.data as Admin;
}

export async function changePassword(current: string, next: string): Promise<void> {
  const res = await authed(`/api/v1/admin/password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ current_password: current, new_password: next }),
  });
  if (!res.ok) throw new Error(await parseError(res, "Đổi mật khẩu thất bại."));
}

/* ---------- content ---------- */

/** Load current site content (public endpoint), merged onto defaults. */
export async function fetchContent(): Promise<SiteContent> {
  const res = await fetch(`${API}/api/v1/content`, { cache: "no-store" });
  if (!res.ok) return DEFAULT_CONTENT;
  const json = await res.json();
  const d = json?.data ?? {};
  return {
    ...DEFAULT_CONTENT,
    ...d,
    hero: { ...DEFAULT_CONTENT.hero, ...(d.hero ?? {}) },
    about: { ...DEFAULT_CONTENT.about, ...(d.about ?? {}) },
    values: { ...DEFAULT_CONTENT.values, ...(d.values ?? {}) },
    sectors: { ...DEFAULT_CONTENT.sectors, ...(d.sectors ?? {}) },
    projects: { ...DEFAULT_CONTENT.projects, ...(d.projects ?? {}) },
    partners: { ...DEFAULT_CONTENT.partners, ...(d.partners ?? {}) },
    contact: { ...DEFAULT_CONTENT.contact, ...(d.contact ?? {}) },
    footer: { ...DEFAULT_CONTENT.footer, ...(d.footer ?? {}) },
  };
}

export async function saveContent(content: SiteContent): Promise<void> {
  const res = await authed(`/api/v1/admin/content`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content),
  });
  if (!res.ok) throw new Error(await parseError(res, "Lưu nội dung thất bại."));
}

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await authed(`/api/v1/admin/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error(await parseError(res, "Tải ảnh thất bại."));
  const json = await res.json();
  return json?.data?.url as string;
}

/** List previously uploaded images (newest first) for the media library. */
export async function listUploads(): Promise<string[]> {
  const res = await authed(`/api/v1/admin/uploads`);
  if (!res.ok) throw new Error(await parseError(res, "Không tải được thư viện ảnh."));
  const json = await res.json();
  return (json?.data ?? []) as string[];
}

/* ---------- inquiries ---------- */

export const INQUIRY_STATUSES = ["new", "read", "contacted", "archived"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  budget_range: string;
  status: InquiryStatus;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type InquiryQuery = {
  page?: number;
  limit?: number;
  status?: InquiryStatus | "";
  q?: string;
};

function inquiryParams(query: InquiryQuery): string {
  const p = new URLSearchParams();
  if (query.page) p.set("page", String(query.page));
  if (query.limit) p.set("limit", String(query.limit));
  if (query.status) p.set("status", query.status);
  if (query.q) p.set("q", query.q);
  return p.toString();
}

export async function fetchInquiries(
  query: InquiryQuery = {},
): Promise<{ items: Inquiry[]; total: number; page: number; limit: number }> {
  const res = await authed(`/api/v1/admin/inquiries?${inquiryParams(query)}`);
  if (!res.ok) throw new Error(await parseError(res, "Không tải được danh sách."));
  const json = await res.json();
  return {
    items: json?.data ?? [],
    total: json?.meta?.total ?? 0,
    page: json?.meta?.page ?? 1,
    limit: json?.meta?.limit ?? 20,
  };
}

export async function updateInquiry(
  id: string,
  patch: { status?: InquiryStatus; notes?: string },
): Promise<Inquiry> {
  const res = await authed(`/api/v1/admin/inquiries/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(await parseError(res, "Cập nhật thất bại."));
  return (await res.json())?.data as Inquiry;
}

export async function deleteInquiry(id: string): Promise<void> {
  const res = await authed(`/api/v1/admin/inquiries/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await parseError(res, "Xoá thất bại."));
}

/** Download the filtered inbox as a CSV file via an authorized blob fetch. */
export async function exportInquiries(query: InquiryQuery = {}): Promise<void> {
  const res = await authed(`/api/v1/admin/inquiries/export?${inquiryParams(query)}`);
  if (!res.ok) throw new Error(await parseError(res, "Xuất CSV thất bại."));
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ventis-lien-he.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ---------- dashboard ---------- */

export type Stats = {
  total: number;
  last_7_days: number;
  by_status: Record<InquiryStatus, number>;
};

export async function fetchStats(): Promise<Stats> {
  const res = await authed(`/api/v1/admin/stats`);
  if (!res.ok) throw new Error(await parseError(res, "Không tải được thống kê."));
  return (await res.json())?.data as Stats;
}
