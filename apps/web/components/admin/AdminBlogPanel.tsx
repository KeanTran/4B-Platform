'use client';

import { useEffect, useMemo, useState } from 'react';
import { Archive, CheckCircle2, FilePenLine, Loader2, Search, Send, ShieldCheck, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { BLOG_STATUS_LABELS } from '@/lib/blog';
import type { AdminBlogPost, BlogStatus } from '@/types/blog';

type BlogFilter = 'all' | BlogStatus;

const STATUS_OPTIONS = Object.entries(BLOG_STATUS_LABELS) as Array<[BlogStatus, string]>;

function formatDate(value: string | null) {
  if (!value) return 'Chưa xuất bản';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function statusColors(status: BlogStatus) {
  if (status === 'published') return { background: 'var(--color-bg-soft-primary)', color: 'var(--primary-dark)' };
  if (status === 'pending') return { background: 'var(--color-bg-warning-soft)', color: 'var(--warning)' };
  if (status === 'archived') return { background: 'var(--bg-light)', color: 'var(--text-muted)' };
  return { background: 'var(--surface)', color: 'var(--text-main)' };
}

function BlogEditor({
  post,
  onSave,
  onDelete,
  deleting,
}: {
  post: AdminBlogPost;
  onSave: (input: Record<string, unknown>) => Promise<boolean>;
  onDelete: (post: AdminBlogPost) => Promise<boolean>;
  deleting: boolean;
}) {
  const [form, setForm] = useState({
    title: post.title,
    slug: post.slug,
    author_name: post.author_name,
    category: post.category,
    excerpt: post.excerpt ?? '',
    content: post.content,
    seo_title: post.seo_title ?? '',
    meta_description: post.meta_description ?? '',
    cover_image_url: post.cover_image_url ?? '',
    cover_image_alt: post.cover_image_alt ?? '',
    status: post.status,
  });
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({
        id: post.id,
        ...form,
        excerpt: form.excerpt || null,
        seo_title: form.seo_title || null,
        meta_description: form.meta_description || null,
        cover_image_url: form.cover_image_url || null,
        cover_image_alt: form.cover_image_alt || null,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="space-y-1.5 text-sm font-bold" style={{ color: 'var(--text-heading)' }}>
          Tiêu đề
          <input
            required
            minLength={3}
            maxLength={180}
            value={form.title}
            onChange={(event) => update('title', event.target.value)}
            className="h-11 w-full rounded-xl border bg-[var(--surface)] px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--primary-light)]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
          />
        </label>
        <label className="space-y-1.5 text-sm font-bold" style={{ color: 'var(--text-heading)' }}>
          Slug
          <input
            required
            maxLength={200}
            value={form.slug}
            onChange={(event) => update('slug', event.target.value)}
            className="h-11 w-full rounded-xl border bg-[var(--surface)] px-3 font-mono text-xs font-normal outline-none focus:ring-2 focus:ring-[var(--primary-light)]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
          />
        </label>
        <label className="space-y-1.5 text-sm font-bold" style={{ color: 'var(--text-heading)' }}>
          Tác giả
          <input
            required
            minLength={2}
            maxLength={80}
            value={form.author_name}
            onChange={(event) => update('author_name', event.target.value)}
            className="h-11 w-full rounded-xl border bg-[var(--surface)] px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--primary-light)]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
          />
        </label>
        <label className="space-y-1.5 text-sm font-bold" style={{ color: 'var(--text-heading)' }}>
          Chuyên mục
          <input
            required
            minLength={2}
            maxLength={80}
            value={form.category}
            onChange={(event) => update('category', event.target.value)}
            className="h-11 w-full rounded-xl border bg-[var(--surface)] px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--primary-light)]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
          />
        </label>
      </div>

      <label className="block space-y-1.5 text-sm font-bold" style={{ color: 'var(--text-heading)' }}>
        Tóm tắt
        <textarea
          maxLength={500}
          rows={3}
          value={form.excerpt}
          onChange={(event) => update('excerpt', event.target.value)}
          className="w-full rounded-xl border bg-[var(--surface)] px-3 py-2.5 text-sm font-normal leading-relaxed outline-none focus:ring-2 focus:ring-[var(--primary-light)]"
          style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
        />
      </label>

      <label className="block space-y-1.5 text-sm font-bold" style={{ color: 'var(--text-heading)' }}>
        Nội dung
        <textarea
          required
          minLength={20}
          maxLength={50000}
          rows={10}
          value={form.content}
          onChange={(event) => update('content', event.target.value)}
          className="w-full rounded-xl border bg-[var(--surface)] px-3 py-2.5 text-sm font-normal leading-relaxed outline-none focus:ring-2 focus:ring-[var(--primary-light)]"
          style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
        />
      </label>

      <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-border-soft-primary)', background: 'var(--color-bg-soft-primary)' }}>
        <div className="mb-3 flex items-center gap-2">
          <Search size={16} style={{ color: 'var(--primary)' }} />
          <h4 className="text-sm font-extrabold" style={{ color: 'var(--text-heading)' }}>Thông tin SEO</h4>
        </div>
        <div className="space-y-4">
          <label className="block space-y-1.5 text-xs font-bold" style={{ color: 'var(--text-heading)' }}>
            SEO title
            <input
              maxLength={120}
              value={form.seo_title}
              onChange={(event) => update('seo_title', event.target.value)}
              placeholder="Để trống sẽ dùng tiêu đề bài viết"
              className="h-10 w-full rounded-xl border bg-[var(--surface)] px-3 text-sm font-normal outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
            />
          </label>
          <label className="block space-y-1.5 text-xs font-bold" style={{ color: 'var(--text-heading)' }}>
            Meta description
            <textarea
              maxLength={320}
              rows={3}
              value={form.meta_description}
              onChange={(event) => update('meta_description', event.target.value)}
              placeholder="Để trống sẽ dùng phần tóm tắt"
              className="w-full rounded-xl border bg-[var(--surface)] px-3 py-2.5 text-sm font-normal outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
            />
          </label>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-1.5 text-xs font-bold" style={{ color: 'var(--text-heading)' }}>
              Ảnh cover URL
              <input
                maxLength={2000}
                value={form.cover_image_url}
                onChange={(event) => update('cover_image_url', event.target.value)}
                className="h-10 w-full rounded-xl border bg-[var(--surface)] px-3 text-sm font-normal outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
              />
            </label>
            <label className="space-y-1.5 text-xs font-bold" style={{ color: 'var(--text-heading)' }}>
              Alt của ảnh cover
              <input
                maxLength={240}
                value={form.cover_image_alt}
                onChange={(event) => update('cover_image_alt', event.target.value)}
                className="h-10 w-full rounded-xl border bg-[var(--surface)] px-3 text-sm font-normal outline-none"
                style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-end sm:justify-between" style={{ borderColor: 'var(--border)' }}>
        <label className="space-y-1.5 text-sm font-bold" style={{ color: 'var(--text-heading)' }}>
          Trạng thái xuất bản
          <select
            aria-label="Trạng thái bài viết"
            value={form.status}
            onChange={(event) => update('status', event.target.value)}
            className="block h-11 min-w-48 rounded-xl border bg-[var(--surface)] px-3 text-sm outline-none"
            style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
          >
            {STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={saving || deleting}
            onClick={() => setConfirmingDelete(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
            style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
          >
            <Trash2 size={16} /> Xóa bài viết
          </button>
          <button
            type="submit"
            disabled={saving || deleting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: 'var(--gradient-primary)' }}
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : form.status === 'published' ? <Send size={16} /> : <FilePenLine size={16} />}
            {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      {confirmingDelete ? (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
          style={{
            borderColor: 'var(--danger)',
            background: 'color-mix(in srgb, var(--danger) 8%, var(--surface))',
          }}
        >
          <div>
            <p className="text-sm font-extrabold" style={{ color: 'var(--danger)' }}>Xóa vĩnh viễn bài viết này?</p>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              Bài “{post.title}” sẽ biến mất khỏi Blog và sitemap. Thao tác này không thể hoàn tác.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              disabled={deleting}
              onClick={() => setConfirmingDelete(false)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold disabled:opacity-60"
              style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
            >
              <X size={15} /> Hủy
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={() => void onDelete(post)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: 'var(--danger)' }}
            >
              {deleting ? <Loader2 className="animate-spin" size={15} /> : <Trash2 size={15} />}
              {deleting ? 'Đang xóa…' : 'Xóa vĩnh viễn'}
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}

export function AdminBlogPanel() {
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BlogFilter>('pending');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadPosts() {
      try {
        const response = await fetch('/api/admin/blog', { cache: 'no-store' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? 'Không thể tải bài viết.');
        if (!active) return;
        const nextPosts = result.posts as AdminBlogPost[];
        setPosts(nextPosts);
        setSelectedId(nextPosts.find((post) => post.status === 'pending')?.id ?? nextPosts[0]?.id ?? null);
      } catch (error) {
        if (active) toast.error(error instanceof Error ? error.message : 'Không thể tải bài viết.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadPosts();
    return () => { active = false; };
  }, []);

  const filteredPosts = useMemo(
    () => filter === 'all' ? posts : posts.filter((post) => post.status === filter),
    [filter, posts],
  );
  const selectedPost = posts.find((post) => post.id === selectedId) ?? null;
  const pendingCount = posts.filter((post) => post.status === 'pending').length;

  async function savePost(input: Record<string, unknown>) {
    try {
      const response = await fetch('/api/admin/blog', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Không thể cập nhật bài viết.');
      const updated = result.post as AdminBlogPost;
      setPosts((current) => current.map((post) => post.id === updated.id ? updated : post));
      toast.success(updated.status === 'published' ? 'Đã xuất bản bài viết.' : 'Đã lưu bài viết.');
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật bài viết.');
      return false;
    }
  }

  async function deletePost(post: AdminBlogPost) {
    setDeletingId(post.id);
    try {
      const response = await fetch('/api/admin/blog', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: post.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Không thể xóa bài viết.');

      const remainingPosts = posts.filter((item) => item.id !== post.id);
      setPosts(remainingPosts);
      if (selectedId === post.id) {
        setSelectedId(
          remainingPosts.find((item) => item.status === filter)?.id
          ?? remainingPosts[0]?.id
          ?? null,
        );
      }
      toast.success('Đã xóa bài viết.');
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa bài viết.');
      return false;
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <Card variant="surface" className="flex min-h-64 items-center justify-center gap-2 p-6 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Loader2 className="animate-spin" size={18} /> Đang tải hàng chờ biên tập…
      </Card>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <Card variant="surface" className="h-fit overflow-hidden">
        <div className="border-b p-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold" style={{ color: 'var(--text-heading)' }}>Hàng chờ bài viết</h3>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{pendingCount} bài đang chờ duyệt</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}>
              <ShieldCheck size={18} />
            </span>
          </div>
          <label className="mt-4 block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
            Lọc trạng thái
            <select
              aria-label="Lọc trạng thái bài viết"
              value={filter}
              onChange={(event) => setFilter(event.target.value as BlogFilter)}
              className="mt-1.5 h-10 w-full rounded-xl border bg-[var(--surface)] px-3 text-sm outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
            >
              <option value="all">Tất cả bài viết</option>
              {STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>

        <div className="max-h-[680px] overflow-y-auto p-2">
          {filteredPosts.length === 0 ? (
            <div className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Không có bài viết ở trạng thái này.</div>
          ) : filteredPosts.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => setSelectedId(post.id)}
              className="mb-1 w-full rounded-xl border p-3 text-left transition-colors"
              style={{
                borderColor: selectedId === post.id ? 'var(--primary)' : 'transparent',
                background: selectedId === post.id ? 'var(--color-bg-soft-primary)' : 'transparent',
              }}
            >
              <span className="mb-2 inline-flex rounded-full px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide" style={statusColors(post.status)}>
                {BLOG_STATUS_LABELS[post.status]}
              </span>
              <span className="block line-clamp-2 text-sm font-bold" style={{ color: 'var(--text-heading)' }}>{post.title}</span>
              <span className="mt-1 block text-xs" style={{ color: 'var(--text-muted)' }}>{post.author_name} · {formatDate(post.created_at)}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card variant="surface" className="p-5 sm:p-6">
        {selectedPost ? (
          <>
            <div className="mb-5 flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: 'var(--border)' }}>
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--primary)' }}>
                  {selectedPost.status === 'published' ? <CheckCircle2 size={14} /> : selectedPost.status === 'archived' ? <Archive size={14} /> : <FilePenLine size={14} />}
                  Biên tập bài viết
                </div>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Xuất bản: {formatDate(selectedPost.published_at)}</p>
              </div>
              <span className="rounded-full px-3 py-1.5 text-xs font-bold" style={statusColors(selectedPost.status)}>{BLOG_STATUS_LABELS[selectedPost.status]}</span>
            </div>
            <BlogEditor
              key={selectedPost.id}
              post={selectedPost}
              onSave={savePost}
              onDelete={deletePost}
              deleting={deletingId === selectedPost.id}
            />
          </>
        ) : (
          <div className="flex min-h-64 items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>Chọn một bài viết để biên tập.</div>
        )}
      </Card>
    </div>
  );
}
