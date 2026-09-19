import Link from 'next/link';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export default function BlogPostNotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-[5%] pb-16 pt-28">
      <div className="glass-surface-strong max-w-xl rounded-3xl p-8 text-center sm:p-12">
        <FileQuestion className="mx-auto" size={44} style={{ color: 'var(--primary)' }} />
        <h1 className="brand-font mt-4 text-2xl font-extrabold" style={{ color: 'var(--text-heading)' }}>Không tìm thấy bài viết</h1>
        <p className="mt-3 text-sm leading-6" style={{ color: 'var(--text-muted)' }}>Bài viết có thể đã được chuyển về bản nháp, lưu trữ hoặc đường dẫn không còn chính xác.</p>
        <Link href="/blog" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold text-white no-underline" style={{ background: 'var(--primary)' }}><ArrowLeft size={15} /> Quay lại Blog</Link>
      </div>
    </div>
  );
}
