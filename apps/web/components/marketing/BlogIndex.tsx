import Link from 'next/link';
import { ArrowRight, BookOpen, PenLine, Sparkles } from 'lucide-react';
import { BlogCard } from '@/components/marketing/BlogCard';
import { BlogSubmission } from '@/components/marketing/BlogSubmission';
import type { PublicBlogPost } from '@/types/blog';

export function BlogIndex({ posts }: { posts: PublicBlogPost[] }) {
  const [featured, ...remainingPosts] = posts;

  return (
    <div className="pb-20 pt-24 sm:pt-28">
      <section className="px-[5%]">
        <div className="glass-surface-strong mx-auto max-w-[1240px] overflow-hidden rounded-[32px] p-6 sm:p-9 lg:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-extrabold" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--primary)' }}>
                <PenLine size={13} /> Cộng Đồng 4B
              </span>
              <h1 className="brand-font mt-4 text-3xl font-extrabold leading-tight tracking-[-0.03em] sm:text-5xl" style={{ color: 'var(--text-heading)' }}>
                Góc Chia Sẻ &amp; Kinh Nghiệm
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7" style={{ color: 'var(--text-muted)' }}>
                Kinh nghiệm quản lý chi tiêu, cách sống chung dễ chịu và những câu chuyện thật từ cộng đồng ở ghép.
              </p>
            </div>
            <BlogSubmission />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-[1240px] px-[5%]">
        {featured ? (
          <>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em]" style={{ color: 'var(--primary)' }}>Mới từ cộng đồng</p>
                <h2 className="brand-font mt-1 text-2xl font-extrabold" style={{ color: 'var(--text-heading)' }}>Bài viết nổi bật</h2>
              </div>
              <span className="hidden items-center gap-1.5 text-xs font-bold sm:inline-flex" style={{ color: 'var(--text-muted)' }}><Sparkles size={14} /> Nội dung đã được admin duyệt</span>
            </div>
            <div className="relative"><BlogCard post={featured} /></div>

            {remainingPosts.length > 0 ? (
              <div className="mt-10">
                <h2 className="brand-font mb-5 text-2xl font-extrabold" style={{ color: 'var(--text-heading)' }}>Khám phá thêm</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {remainingPosts.map((post) => <div key={post.id} className="relative"><BlogCard post={post} /></div>)}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-3xl border p-10 text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <BookOpen className="mx-auto" size={42} style={{ color: 'var(--primary)' }} />
            <h2 className="mt-4 text-xl font-extrabold" style={{ color: 'var(--text-heading)' }}>Chưa có bài viết công khai</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6" style={{ color: 'var(--text-muted)' }}>Bạn có thể gửi câu chuyện đầu tiên. Admin sẽ đọc và duyệt trước khi bài xuất hiện trên Blog.</p>
            <div className="mt-5"><BlogSubmission /></div>
          </div>
        )}
      </section>

      <section className="mx-auto mt-10 max-w-[1240px] px-[5%]">
        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl border p-6 sm:flex-row sm:items-center sm:p-8" style={{ background: 'var(--dark-surface)', borderColor: 'var(--color-footer-divider)' }}>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em]" style={{ color: 'var(--primary-light)' }}>For Better Balance</p>
            <h2 className="brand-font mt-2 text-2xl font-extrabold text-white">Biến kinh nghiệm thành thói quen quản lý tốt hơn.</h2>
          </div>
          <Link href="/dashboard" prefetch className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl px-5 text-sm font-bold text-white no-underline" style={{ background: 'var(--primary)' }}>Dùng Dashboard miễn phí <ArrowRight size={16} /></Link>
        </div>
      </section>
    </div>
  );
}
