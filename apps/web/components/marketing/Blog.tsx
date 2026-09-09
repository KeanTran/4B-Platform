'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PenLine, Plus, Clock, User, Calendar, X, BookOpen, Loader2 } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  category: string;
  author_name: string;
  created_at: string;
}

const CATEGORIES = [
  { name: 'Mẹo hay', color: '#3f7f12', bg: '#eef8e8' },
  { name: 'Kinh nghiệm', color: '#f9a23d', bg: '#fff6ec' },
  { name: 'Tài chính phòng trọ', color: '#2563eb', bg: '#eff6ff' },
  { name: 'Nấu ăn & Tiết kiệm', color: '#16a34a', bg: '#f0fdf4' },
  { name: 'Khác', color: '#64748b', bg: '#f8fafc' },
];

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    author_name: '',
    title: '',
    category: 'Mẹo hay',
    excerpt: '',
    content: '',
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/blog');
      const data = await res.json();
      if (data.posts && Array.isArray(data.posts)) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách bài viết:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || !formData.author_name.trim()) {
      toast.error('Vui lòng điền họ tên, tiêu đề và nội dung bài viết');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          excerpt: formData.excerpt.trim() || formData.content.trim().slice(0, 140) + '...',
          author_name: formData.author_name.trim(),
          category: formData.category,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi đăng bài');
      }

      toast.success('Đăng bài viết thành công! Bài viết đã sẵn sàng trên toàn hệ thống.');
      setFormData({
        author_name: '',
        title: '',
        category: 'Mẹo hay',
        excerpt: '',
        content: '',
      });
      setIsCreateModalOpen(false);
      // Prepend to posts
      if (data.post) {
        setPosts((prev) => [data.post, ...prev]);
      } else {
        fetchPosts();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể đăng bài viết';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryConfig = (catName: string) => {
    return CATEGORIES.find((c) => c.name === catName) || {
      name: catName,
      color: '#3f7f12',
      bg: '#eef8e8',
    };
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section
      id="blog"
      className="py-[80px]"
      style={{ background: 'var(--color-bg-soft-primary)' }}
    >
      <div className="mx-auto max-w-[1240px] px-[5%]">
        {/* Section Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span
              className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                background: 'var(--surface)',
                color: 'var(--primary)',
                border: '1px solid var(--border)',
              }}
            >
              <PenLine className="h-3.5 w-3.5" />
              Cộng Đồng 4B
            </span>
            <h2
              className="brand-font text-3xl font-extrabold md:text-[36px]"
              style={{ color: 'var(--dark)' }}
            >
              Góc Chia Sẻ & Kinh Nghiệm
            </h2>
            <p className="mt-2 text-base" style={{ color: 'var(--text-muted)' }}>
              Cùng nhau chia sẻ mẹo quản lý chi tiêu, bí quyết ở ghép êm ấm và kinh nghiệm cuộc sống phòng trọ.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95"
            style={{ background: 'var(--primary)' }}
          >
            <Plus className="h-4 w-4" />
            Viết bài chia sẻ
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)] mb-3" />
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Đang tải danh sách bài viết...
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div
            className="rounded-2xl border p-12 text-center"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <BookOpen className="mx-auto h-12 w-12 text-[var(--text-muted)] mb-3 opacity-40" />
            <h3 className="text-lg font-bold" style={{ color: 'var(--dark)' }}>
              Chưa có bài viết nào
            </h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Hãy là người đầu tiên chia sẻ kinh nghiệm ở ghép bổ ích!
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ background: 'var(--primary)' }}
            >
              <Plus className="h-4 w-4" />
              Đăng bài ngay
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((post) => {
              const catConfig = getCategoryConfig(post.category);
              return (
                <article
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="group flex flex-col justify-between cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="p-6">
                    {/* Header meta */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{
                          background: catConfig.bg,
                          color: catConfig.color,
                        }}
                      >
                        {post.category}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-medium"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.created_at)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className="mb-2.5 text-lg font-bold leading-snug transition-colors group-hover:text-[var(--primary)] line-clamp-2"
                      style={{ color: 'var(--dark)' }}
                    >
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p
                      className="text-sm leading-relaxed line-clamp-3"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-between border-t px-6 py-3.5"
                    style={{ borderColor: 'var(--border)', background: 'var(--color-bg-soft-primary)' }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                        style={{ background: 'var(--primary)' }}
                      >
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div
                          className="text-xs font-semibold truncate max-w-[140px]"
                          style={{ color: 'var(--dark)' }}
                        >
                          {post.author_name}
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          Tác giả
                        </div>
                      </div>
                    </div>

                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold group-hover:underline"
                      style={{ color: 'var(--primary)' }}
                    >
                      Đọc tiếp
                      <i className="fa-solid fa-arrow-right text-[10px]" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Modal Viết Bài Mới */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div
              className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div
                className="flex items-center justify-between border-b px-6 py-4"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                    style={{ background: 'var(--primary)' }}
                  >
                    <PenLine className="h-4 w-4" />
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--dark)' }}>
                    Viết Bài Chia Sẻ Mới
                  </h3>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--dark)' }}>
                    Họ và tên tác giả <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn An"
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    style={{
                      background: 'var(--color-bg-soft-primary)',
                      borderColor: 'var(--border)',
                      color: 'var(--dark)',
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--dark)' }}>
                      Chuyên mục
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      style={{
                        background: 'var(--color-bg-soft-primary)',
                        borderColor: 'var(--border)',
                        color: 'var(--dark)',
                      }}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--dark)' }}>
                      Tóm tắt ngắn
                    </label>
                    <input
                      type="text"
                      placeholder="Mô tả tóm tắt nội dung..."
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      style={{
                        background: 'var(--color-bg-soft-primary)',
                        borderColor: 'var(--border)',
                        color: 'var(--dark)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--dark)' }}>
                    Tiêu đề bài viết <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Bí quyết phân chia tiền điện nước không cãi vã"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    style={{
                      background: 'var(--color-bg-soft-primary)',
                      borderColor: 'var(--border)',
                      color: 'var(--dark)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--dark)' }}>
                    Nội dung chi tiết <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Viết nội dung chia sẻ chi tiết của bạn tại đây..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    style={{
                      background: 'var(--color-bg-soft-primary)',
                      borderColor: 'var(--border)',
                      color: 'var(--dark)',
                    }}
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t" style={{ borderColor: 'var(--border)' }}>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="rounded-xl border px-4 py-2.5 text-sm font-semibold text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    style={{ background: 'var(--primary)' }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang đăng bài...
                      </>
                    ) : (
                      <>
                        <PenLine className="h-4 w-4" />
                        Đăng bài ngay
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Xem Chi Tiết Bài Viết */}
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div
              className="w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden transition-all max-h-[85vh] flex flex-col"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div
                className="flex items-center justify-between border-b px-6 py-4"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{
                      background: getCategoryConfig(selectedPost.category).bg,
                      color: getCategoryConfig(selectedPost.category).color,
                    }}
                  >
                    {selectedPost.category}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                <h2 className="text-2xl font-extrabold leading-tight" style={{ color: 'var(--dark)' }}>
                  {selectedPost.title}
                </h2>

                <div
                  className="flex items-center gap-4 py-2 border-y text-xs font-medium"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                >
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-[var(--primary)]" />
                    <span>Người viết: <strong style={{ color: 'var(--dark)' }}>{selectedPost.author_name}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[var(--primary)]" />
                    <span>Ngày đăng: {formatDate(selectedPost.created_at)}</span>
                  </div>
                </div>

                <div
                  className="text-base leading-relaxed whitespace-pre-line pt-2"
                  style={{ color: 'var(--dark)' }}
                >
                  {selectedPost.content || selectedPost.excerpt}
                </div>
              </div>

              <div
                className="flex items-center justify-end border-t px-6 py-3.5 bg-slate-50 dark:bg-slate-900/50"
                style={{ borderColor: 'var(--border)' }}
              >
                <button
                  onClick={() => setSelectedPost(null)}
                  className="rounded-xl px-5 py-2 text-sm font-semibold text-white"
                  style={{ background: 'var(--primary)' }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
