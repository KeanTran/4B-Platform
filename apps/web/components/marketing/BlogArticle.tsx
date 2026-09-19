import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, UserRound } from 'lucide-react';
import { BlogCard } from '@/components/marketing/BlogCard';
import { formatBlogDate, getBlogReadingMinutes, isSupportedBlogCoverUrl } from '@/lib/blog';
import { buildBlogPostJsonLd } from '@/lib/blog-seo';
import { serializeJsonLd } from '@/lib/site';
import type { PublicBlogPost } from '@/types/blog';

function ArticleBody({ content }: { content: string }) {
  const paragraphs = content.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  return (
    <div className="space-y-5 text-[16px] leading-8 sm:text-[17px]" style={{ color: 'var(--text-main)' }}>
      {paragraphs.map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 24)}`} className="whitespace-pre-line">{paragraph}</p>
      ))}
    </div>
  );
}

export function BlogArticle({ post, relatedPosts }: { post: PublicBlogPost; relatedPosts: PublicBlogPost[] }) {
  const jsonLd = buildBlogPostJsonLd(post);
  const showCover = isSupportedBlogCoverUrl(post.cover_image_url);

  return (
    <article className="pb-20 pt-24 sm:pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd.article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd.breadcrumb) }} />

      <header className="px-[5%]">
        <div className="mx-auto max-w-[920px]">
          <nav aria-label="Breadcrumb" className="mb-7 flex flex-wrap items-center gap-2 text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
            <Link href="/" className="no-underline" style={{ color: 'inherit' }}>Trang chủ</Link>
            <span aria-hidden="true">/</span>
            <Link href="/blog" className="no-underline" style={{ color: 'inherit' }}>Blog</Link>
            <span aria-hidden="true">/</span>
            <span className="max-w-[300px] truncate" style={{ color: 'var(--primary)' }}>{post.title}</span>
          </nav>

          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold no-underline" style={{ color: 'var(--primary)' }}><ArrowLeft size={15} /> Quay lại Blog</Link>
          <div className="mt-6 inline-flex rounded-full px-3 py-1 text-xs font-extrabold" style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}>{post.category}</div>
          <h1 className="brand-font mt-4 text-3xl font-extrabold leading-tight tracking-[-0.03em] sm:text-5xl" style={{ color: 'var(--text-heading)' }}>{post.title}</h1>
          {post.excerpt ? <p className="mt-5 text-lg leading-8" style={{ color: 'var(--text-muted)' }}>{post.excerpt}</p> : null}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-y py-4 text-xs font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            <span className="inline-flex items-center gap-1.5"><UserRound size={14} style={{ color: 'var(--primary)' }} />{post.author_name}</span>
            <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} style={{ color: 'var(--primary)' }} />{formatBlogDate(post.published_at || post.created_at)}</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 size={14} style={{ color: 'var(--primary)' }} />{getBlogReadingMinutes(post.content)} phút đọc</span>
          </div>
        </div>
      </header>

      {showCover ? (
        <div className="relative mx-auto mt-8 aspect-[16/8] max-w-[1080px] overflow-hidden rounded-3xl">
          <Image src={post.cover_image_url!} alt={post.cover_image_alt || post.title} fill priority sizes="(max-width: 1080px) 90vw, 1080px" className="object-cover" />
        </div>
      ) : null}

      <div className="mx-auto mt-10 max-w-[760px] px-[5%]">
        <ArticleBody content={post.content} />
        <div className="mt-10 rounded-3xl border p-6 sm:p-8" style={{ background: 'var(--color-bg-soft-primary)', borderColor: 'var(--color-border-soft-primary)' }}>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em]" style={{ color: 'var(--primary)' }}>Áp dụng ngay cùng 4B</p>
          <h2 className="brand-font mt-2 text-xl font-extrabold" style={{ color: 'var(--text-heading)' }}>Quản lý phòng, chia tiền và giữ mọi thứ rõ ràng hơn.</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/dashboard" prefetch className="inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold text-white no-underline" style={{ background: 'var(--primary)' }}>Dùng Dashboard miễn phí <ArrowRight size={15} /></Link>
            <Link href="/pricing" prefetch className="inline-flex h-11 items-center rounded-xl border px-5 text-sm font-bold no-underline" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-main)' }}>Khám phá gói Pro</Link>
          </div>
        </div>
      </div>

      {relatedPosts.length > 0 ? (
        <section aria-labelledby="related-posts-title" className="mx-auto mt-14 max-w-[1240px] px-[5%]">
          <h2 id="related-posts-title" className="brand-font mb-5 text-2xl font-extrabold" style={{ color: 'var(--text-heading)' }}>Bài viết cùng chủ đề</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {relatedPosts.map((related) => <div key={related.id} className="relative"><BlogCard post={related} compact /></div>)}
          </div>
        </section>
      ) : null}
    </article>
  );
}
