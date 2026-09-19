import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Clock3, UserRound } from 'lucide-react';
import { formatBlogDate, getBlogReadingMinutes, isSupportedBlogCoverUrl } from '@/lib/blog';
import type { PublicBlogPost } from '@/types/blog';

export function BlogCard({ post, compact = false }: { post: PublicBlogPost; compact?: boolean }) {
  const publishedDate = formatBlogDate(post.published_at || post.created_at);
  const showCover = isSupportedBlogCoverUrl(post.cover_image_url);

  return (
    <article className="interactive-lift group relative flex h-full flex-col overflow-hidden rounded-3xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      {showCover ? (
        <div className={`relative overflow-hidden ${compact ? 'aspect-[16/8]' : 'aspect-[16/9]'}`}>
          <Image src={post.cover_image_url!} alt={post.cover_image_alt || post.title} fill sizes={compact ? '(max-width: 768px) 100vw, 33vw' : '(max-width: 768px) 100vw, 50vw'} className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        </div>
      ) : (
        <div className={`relative overflow-hidden ${compact ? 'h-28' : 'h-40'}`} style={{ background: 'linear-gradient(135deg, var(--color-bg-soft-primary), var(--accent-light))' }}>
          <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full border opacity-60" style={{ borderColor: 'var(--primary-light)' }} />
          <div className="absolute bottom-5 left-6 rounded-full px-3 py-1 text-xs font-extrabold" style={{ background: 'var(--surface)', color: 'var(--primary)' }}>{post.category}</div>
        </div>
      )}

      <div className={`flex flex-1 flex-col ${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
          <span className="inline-flex items-center gap-1"><CalendarDays size={12} />{publishedDate}</span>
          <span className="inline-flex items-center gap-1"><Clock3 size={12} />{getBlogReadingMinutes(post.content)} phút đọc</span>
        </div>
        <h2 className={`mt-3 font-extrabold leading-snug ${compact ? 'text-base' : 'text-xl'}`} style={{ color: 'var(--text-heading)' }}>
          <Link href={`/blog/${post.slug}`} prefetch className="no-underline after:absolute after:inset-0" style={{ color: 'inherit' }}>{post.title}</Link>
        </h2>
        {!compact ? <p className="mt-3 line-clamp-3 text-sm leading-6" style={{ color: 'var(--text-muted)' }}>{post.excerpt || post.content}</p> : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs font-bold">
          <span className="inline-flex min-w-0 items-center gap-1.5 truncate" style={{ color: 'var(--text-muted)' }}><UserRound size={13} />{post.author_name}</span>
          <span className="inline-flex shrink-0 items-center gap-1" style={{ color: 'var(--primary)' }}>Đọc bài <ArrowRight size={13} /></span>
        </div>
      </div>
    </article>
  );
}
