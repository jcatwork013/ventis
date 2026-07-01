"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { submitInquiry } from "@/lib/api";
import { ArrowUpRight, VentisMark } from "./icons";
import { MathCaptcha } from "./MathCaptcha";

// Normalise a phone to canonical form (strip separators, unify the +84 prefix),
// matching the backend's normalizePhone so the client and server agree.
function normalizePhone(v: string): string {
  let s = v.replace(/[\s.\-()]/g, "").trim();
  if (s.startsWith("0084")) s = "+84" + s.slice(4);
  else if (/^84\d{9}$/.test(s)) s = "+" + s;
  return s;
}

const VN_PHONE = /^(?:0\d{9}|\+84\d{9})$/;

const schema = z.object({
  name: z.string().min(2, "Vui lòng nhập họ tên."),
  email: z.string().email("Email chưa hợp lệ."),
  phone: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại.")
    .refine((v) => VN_PHONE.test(normalizePhone(v)), "Số điện thoại không hợp lệ (vd: 0901234567 hoặc +84901234567)."),
  budget_range: z.string().optional().or(z.literal("")),
  message: z.string().min(10, "Vui lòng mô tả thêm (từ 10 ký tự)."),
  website: z.string().optional(), // honeypot
});

type FormValues = z.infer<typeof schema>;

const interests = [
  "Đầu tư chiến lược",
  "Phát triển dự án",
  "Thương mại & dịch vụ",
  "Hợp tác M&A",
  "Khác",
];

type Status = "idle" | "loading" | "success" | "error";

export function InquiryForm({ onSuccess }: { onSuccess?: () => void }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [captcha, setCaptcha] = useState({ token: "", answer: "" });
  const onCaptchaChange = useCallback((v: { token: string; answer: string }) => setCaptcha(v), []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    if (!captcha.token || !captcha.answer.trim()) {
      setStatus("error");
      setErrorMsg("Vui lòng hoàn tất bước xác thực chống robot.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      await submitInquiry({
        name: values.name,
        email: values.email,
        phone: normalizePhone(values.phone),
        journey_id: null,
        budget_range: values.budget_range || "",
        travel_date: "",
        message: values.message,
        website: values.website || "",
        captcha_token: captcha.token,
        captcha_answer: captcha.answer,
      });
      setStatus("success");
      reset();
      onSuccess?.();
    } catch (e) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Có lỗi xảy ra, vui lòng thử lại.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-brand border border-line bg-bg-elev p-10 text-center">
        <VentisMark className="mx-auto mb-6 h-10 w-10 text-accent" />
        <p className="eyebrow">Cảm ơn quý vị</p>
        <h3 className="mt-4 font-serif text-2xl font-medium text-ink md:text-3xl">
          Đã nhận được thông tin của bạn.
        </h3>
        <p className="mt-3 text-ink-muted">
          Đội ngũ Ventis sẽ liên hệ lại trong vòng hai ngày làm việc.
        </p>
        <button className="btn-ghost mt-8" onClick={() => setStatus("idle")}>
          Gửi thông tin khác
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2" noValidate>
      {/* Honeypot — visually hidden, must stay empty. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div>
        <label className="field-label" htmlFor="name">Họ và tên</label>
        <input id="name" className="field-input" placeholder="Nguyễn Văn A" {...register("name")} />
        {errors.name && <p className="mt-1 text-xs text-accent">{errors.name.message}</p>}
      </div>

      <div>
        <label className="field-label" htmlFor="email">Email</label>
        <input id="email" className="field-input" placeholder="ban@congty.vn" {...register("email")} />
        {errors.email && <p className="mt-1 text-xs text-accent">{errors.email.message}</p>}
      </div>

      <div>
        <label className="field-label" htmlFor="phone">Số điện thoại</label>
        <input id="phone" type="tel" inputMode="tel" autoComplete="tel" className="field-input" placeholder="0901 234 567" {...register("phone")} />
        {errors.phone && <p className="mt-1 text-xs text-accent">{errors.phone.message}</p>}
      </div>

      <div>
        <label className="field-label" htmlFor="budget_range">Lĩnh vực quan tâm</label>
        <select id="budget_range" className="field-input" {...register("budget_range")}>
          <option value="">Chọn lĩnh vực</option>
          {interests.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="field-label" htmlFor="message">Nội dung trao đổi</label>
        <textarea
          id="message"
          rows={3}
          className="field-input resize-none"
          placeholder="Chia sẻ về cơ hội đầu tư, dự án hoặc nhu cầu hợp tác của bạn."
          {...register("message")}
        />
        {errors.message && <p className="mt-1 text-xs text-accent">{errors.message.message}</p>}
      </div>

      <div className="md:col-span-2">
        <MathCaptcha onChange={onCaptchaChange} />
      </div>

      <div className="md:col-span-2 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <button type="submit" className="group btn-primary" disabled={status === "loading"}>
          {status === "loading" ? "Đang gửi…" : "Gửi thông tin"}
          {status !== "loading" && (
            <ArrowUpRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          )}
        </button>
        {status === "error" && <p className="text-sm text-accent">{errorMsg}</p>}
      </div>
    </form>
  );
}
