import Link from "next/link";
import { VentisMark } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center pt-20">
      <div className="shell text-center">
        <VentisMark className="mx-auto mb-6 h-10 w-10 text-accent" />
        <p className="eyebrow">404</p>
        <h1 className="mt-6 font-serif text-display font-medium text-ink">
          Không tìm thấy trang.
        </h1>
        <p className="mt-4 text-ink-muted">Đường dẫn bạn truy cập không tồn tại hoặc đã được di chuyển.</p>
        <div className="mt-10 flex justify-center gap-4">
          <Link href="/" className="btn-primary">Về trang chủ</Link>
          <Link href="/#contact" className="btn-ghost">Liên hệ Ventis</Link>
        </div>
      </div>
    </div>
  );
}
