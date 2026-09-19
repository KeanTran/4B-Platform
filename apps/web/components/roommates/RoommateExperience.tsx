'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bookmark,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Moon,
  PawPrint,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  UsersRound,
  Wallet,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { RoommateCreatePanel } from './RoommateCreatePanel';
import type { RoommateConnection, RoommatePost, RoommateProfile } from '@/types/roommates';

interface ProfileCard {
  id: string;
  name: string;
  initials: string;
  age: number | null;
  occupation: string;
  location: string;
  budget: string;
  moveIn: string;
  match: number | null;
  bio: string;
  habits: string[];
  color: string;
}

interface ForumCard {
  id: string;
  author: string;
  initials: string;
  title: string;
  content: string;
  location: string;
  budget: string;
  time: string;
  tags: string[];
  replies: number | null;
}

const SAMPLE_PROFILES: ProfileCard[] = [
  {
    id: 'an',
    name: 'Nguyễn Minh An',
    initials: 'AN',
    age: 21,
    occupation: 'Sinh viên năm 3',
    location: 'Bình Thạnh, TP.HCM',
    budget: '2,5 – 3,5 triệu/tháng',
    moveIn: 'Có thể chuyển vào từ 01/10',
    match: 92,
    bio: 'Ưu tiên không gian gọn gàng, tôn trọng giờ nghỉ và chia việc nhà rõ ràng.',
    habits: ['Ngủ trước 23:30', 'Không hút thuốc', 'Thích nấu ăn'],
    color: 'linear-gradient(145deg, #3f7f12, #8db94e)',
  },
  {
    id: 'linh',
    name: 'Trần Ngọc Linh',
    initials: 'NL',
    age: 22,
    occupation: 'Nhân viên thiết kế',
    location: 'Phú Nhuận, TP.HCM',
    budget: '3 – 4 triệu/tháng',
    moveIn: 'Có thể chuyển vào từ 15/10',
    match: 88,
    bio: 'Làm việc giờ hành chính, thích phòng nhiều ánh sáng và có khu vực nấu ăn chung.',
    habits: ['Làm việc giờ hành chính', 'Có nuôi mèo', 'Giữ không gian chung sạch'],
    color: 'linear-gradient(145deg, #f9a23d, #e46e38)',
  },
  {
    id: 'quang',
    name: 'Lê Hoàng Quang',
    initials: 'HQ',
    age: 23,
    occupation: 'Lập trình viên',
    location: 'Quận 7, TP.HCM',
    budget: '3,5 – 4,5 triệu/tháng',
    moveIn: 'Có thể chuyển vào ngay',
    match: 84,
    bio: 'Làm việc hybrid, ưu tiên phòng yên tĩnh và các khoản chi phí được thống nhất rõ ràng.',
    habits: ['Làm việc tại nhà', 'Không tiệc khuya', 'Chia tiền đúng hạn'],
    color: 'linear-gradient(145deg, #754827, #b17d55)',
  },
];

const SAMPLE_FORUM_POSTS: ForumCard[] = [
  {
    id: 'post-1',
    author: 'Mai Anh',
    initials: 'MA',
    title: 'Tìm 1 bạn nữ ở ghép gần Đại học HUTECH',
    content: 'Phòng hiện có 2 người, cần thêm 1 bạn ở lâu dài. Chi phí dự kiến 2,8 triệu/người, điện nước chia theo hóa đơn.',
    location: 'Bình Thạnh, TP.HCM',
    budget: '2,8 triệu/người',
    time: '12 phút trước',
    tags: ['Nữ', 'Không hút thuốc', 'Ở lâu dài'],
    replies: 8,
  },
  {
    id: 'post-2',
    author: 'Quốc Bảo',
    initials: 'QB',
    title: 'Tìm phòng và bạn ở ghép khu vực Quận 7',
    content: 'Mình đi làm giờ hành chính, ngân sách khoảng 3–4 triệu. Mong muốn phòng sạch, yên tĩnh và có chỗ để xe.',
    location: 'Quận 7, TP.HCM',
    budget: '3 – 4 triệu/người',
    time: '35 phút trước',
    tags: ['Nam', 'Giờ hành chính', 'Không nuôi thú cưng'],
    replies: 5,
  },
  {
    id: 'post-3',
    author: 'Thu Hà',
    initials: 'TH',
    title: 'Còn 1 phòng trong căn hộ 2 phòng ngủ',
    content: 'Căn hộ có bếp và ban công, chi phí chung sử dụng 4B để theo dõi. Ưu tiên bạn nữ đi làm hoặc sinh viên năm cuối.',
    location: 'Phú Nhuận, TP.HCM',
    budget: '3,6 triệu/người',
    time: '1 giờ trước',
    tags: ['Nữ', 'Có bếp', 'Có ban công'],
    replies: 12,
  },
];

const PROFILE_COLORS = [
  'linear-gradient(145deg, #3f7f12, #8db94e)',
  'linear-gradient(145deg, #f9a23d, #e46e38)',
  'linear-gradient(145deg, #754827, #b17d55)',
];

function initials(name: string) {
  return name.split(/\s+/).slice(-2).map((part) => part[0]).join('').toUpperCase();
}

function moneyRange(min: number, max: number) {
  const format = (value: number) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(value / 1_000_000);
  return `${format(min)} – ${format(max)} triệu/tháng`;
}

function relativeTime(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 1) return 'Vừa đăng';
  if (minutes < 60) return `${minutes} phút trước`;
  if (minutes < 1_440) return `${Math.floor(minutes / 60)} giờ trước`;
  return `${Math.floor(minutes / 1_440)} ngày trước`;
}

function toProfileCard(profile: RoommateProfile, index: number): ProfileCard {
  return {
    id: profile.id,
    name: profile.display_name,
    initials: initials(profile.display_name),
    age: profile.birth_year ? new Date().getFullYear() - profile.birth_year : null,
    occupation: profile.occupation ?? 'Thành viên 4B',
    location: `${profile.district}, ${profile.city}`,
    budget: moneyRange(profile.budget_min, profile.budget_max),
    moveIn: profile.move_in_date ? `Có thể chuyển vào từ ${new Date(profile.move_in_date).toLocaleDateString('vi-VN')}` : 'Linh hoạt thời gian chuyển vào',
    match: null,
    bio: profile.bio || 'Chưa có lời giới thiệu.',
    habits: profile.habits,
    color: PROFILE_COLORS[index % PROFILE_COLORS.length] ?? PROFILE_COLORS[0]!,
  };
}

function toForumCard(post: RoommatePost): ForumCard {
  return {
    id: post.id,
    author: post.author_name,
    initials: initials(post.author_name),
    title: post.title,
    content: post.content,
    location: `${post.district}, ${post.city}`,
    budget: moneyRange(post.budget_min, post.budget_max),
    time: relativeTime(post.created_at),
    tags: post.tags,
    replies: null,
  };
}

type ViewMode = 'discover' | 'forum';

export function RoommateExperience() {
  const [viewMode, setViewMode] = useState<ViewMode>('discover');
  const [profileIndex, setProfileIndex] = useState(0);
  const [savedProfiles, setSavedProfiles] = useState<Set<string>>(() => new Set());
  const [profiles, setProfiles] = useState<ProfileCard[]>(SAMPLE_PROFILES);
  const [posts, setPosts] = useState<ForumCard[]>(SAMPLE_FORUM_POSTS);
  const [connections, setConnections] = useState<RoommateConnection[]>([]);
  const [connectionBusy, setConnectionBusy] = useState(false);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [cityFilter, setCityFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [moveInDays, setMoveInDays] = useState('');
  const [dataMode, setDataMode] = useState<'loading' | 'live' | 'demo'>('loading');
  const [createKind, setCreateKind] = useState<'profile' | 'post' | null>(null);
  const [search, setSearch] = useState('');

  const activeProfile = profiles[profileIndex] ?? profiles[0];
  const isSaved = activeProfile ? savedProfiles.has(activeProfile.id) : false;
  const activeConnection = activeProfile
    ? connections.find((connection) => connection.profile.id === activeProfile.id)
    : undefined;
  const filteredPosts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi');
    if (!query) return posts;
    return posts.filter((post) => [post.title, post.content, post.location, ...post.tags].some((value) => value.toLocaleLowerCase('vi').includes(query)));
  }, [posts, search]);

  useEffect(() => {
    let active = true;
    async function loadMarketplace() {
      setProfilesLoading(true);
      try {
        const profileParams = new URLSearchParams({ limit: '24' });
        if (cityFilter) profileParams.set('city', cityFilter);
        if (budgetFilter) {
          const [minimum, maximum] = budgetFilter.split('-');
          if (minimum) profileParams.set('budget_min', minimum);
          if (maximum) profileParams.set('budget_max', maximum);
        }
        if (moveInDays) profileParams.set('move_in_days', moveInDays);
        const [profileResponse, postResponse, bookmarkResponse, connectionResponse] = await Promise.all([
          fetch(`/api/roommates/profiles?${profileParams.toString()}`),
          fetch('/api/roommates/posts?limit=30'),
          fetch('/api/roommates/bookmarks'),
          fetch('/api/roommates/connections'),
        ]);
        if (!profileResponse.ok || !postResponse.ok) throw new Error('marketplace unavailable');
        const [profileResult, postResult] = await Promise.all([profileResponse.json(), postResponse.json()]);
        if (!active) return;
        setProfiles((profileResult.profiles as RoommateProfile[]).map(toProfileCard));
        setPosts((postResult.posts as RoommatePost[]).map(toForumCard));
        setProfileIndex(0);
        setDataMode('live');

        if (bookmarkResponse.ok) {
          const bookmarks = await bookmarkResponse.json();
          if (active) setSavedProfiles(new Set(bookmarks.profile_ids));
        }
        if (connectionResponse.ok) {
          const connectionResult = await connectionResponse.json();
          if (active) setConnections(connectionResult.connections as RoommateConnection[]);
        }
      } catch {
        if (active) setDataMode('demo');
      } finally {
        if (active) setProfilesLoading(false);
      }
    }
    void loadMarketplace();
    return () => { active = false; };
  }, [budgetFilter, cityFilter, moveInDays]);

  const advanceProfile = (direction: 1 | -1) => {
    setProfileIndex((current) =>
      profiles.length ? (current + direction + profiles.length) % profiles.length : 0,
    );
  };

  const toggleSaved = async () => {
    if (!activeProfile) return;
    if (dataMode !== 'live') {
      toast.info('Đây là dữ liệu mẫu. Hãy cấu hình Supabase để lưu hồ sơ thật.');
      return;
    }
    const nextSaved = !isSaved;
    try {
      const response = await fetch('/api/roommates/bookmarks', {
        method: nextSaved ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: 'profile', target_id: activeProfile.id }),
      });
      if (!response.ok) throw new Error(response.status === 401 ? 'Bạn cần đăng nhập để lưu hồ sơ.' : 'Không thể cập nhật hồ sơ đã lưu.');
      setSavedProfiles((current) => {
        const next = new Set(current);
        if (nextSaved) next.add(activeProfile.id);
        else next.delete(activeProfile.id);
        return next;
      });
      toast.success(nextSaved ? 'Đã lưu hồ sơ.' : 'Đã bỏ lưu hồ sơ.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật hồ sơ.');
    }
  };

  const addCreatedItem = (item: RoommateProfile | RoommatePost) => {
    if ('display_name' in item) {
      if (item.is_discoverable) setProfiles((current) => [toProfileCard(item, 0), ...current.filter((profile) => profile.id !== item.id)]);
      setViewMode('discover');
    } else {
      setPosts((current) => [toForumCard(item), ...current]);
      setViewMode('forum');
    }
    setDataMode('live');
  };

  const sendConnection = async () => {
    if (!activeProfile || connectionBusy) return;
    if (dataMode !== 'live') {
      toast.info('Kết nối thật sẽ hoạt động sau khi Supabase được cấu hình và áp dụng migration.');
      return;
    }
    setConnectionBusy(true);
    try {
      const response = await fetch('/api/roommates/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: activeProfile.id, message: '' }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.code === 'PROFILE_REQUIRED') setCreateKind('profile');
        throw new Error(result.error ?? 'Không thể gửi lời mời kết nối.');
      }
      setConnections((current) => [
        result.connection as RoommateConnection,
        ...current.filter((connection) => connection.profile.id !== activeProfile.id),
      ]);
      toast.success('Đã gửi lời mời kết nối.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể gửi lời mời.');
    } finally {
      setConnectionBusy(false);
    }
  };

  const updateConnection = async (
    connection: RoommateConnection,
    action: 'accept' | 'decline' | 'cancel' | 'disconnect',
  ) => {
    if (connectionBusy) return;
    setConnectionBusy(true);
    try {
      const response = await fetch('/api/roommates/connections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_id: connection.id, action }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Không thể cập nhật kết nối.');
      setConnections((current) => current.map((item) =>
        item.id === connection.id
          ? { ...item, status: result.connection.status, updated_at: result.connection.updated_at }
          : item,
      ));
      toast.success(action === 'accept' ? 'Hai bạn đã kết nối!' : action === 'disconnect' ? 'Đã kết thúc kết nối.' : 'Đã cập nhật lời mời.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật kết nối.');
    } finally {
      setConnectionBusy(false);
    }
  };

  const handlePrimaryConnectionAction = () => {
    if (!activeConnection || activeConnection.status === 'declined' || activeConnection.status === 'cancelled') {
      void sendConnection();
      return;
    }
    if (activeConnection.status === 'pending' && activeConnection.direction === 'incoming') {
      void updateConnection(activeConnection, 'accept');
    }
  };

  const connectionButtonLabel = !activeConnection || activeConnection.status === 'declined' || activeConnection.status === 'cancelled'
    ? 'Gửi lời mời kết nối'
    : activeConnection.status === 'accepted'
      ? 'Đã kết nối'
      : activeConnection.direction === 'incoming'
        ? 'Chấp nhận kết nối'
        : 'Đang chờ phản hồi';

  return (
    <div className="mx-auto max-w-[1320px] space-y-5">
      <section className="glass-surface-strong overflow-hidden rounded-[var(--radius-xl)] p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div
              className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em]"
              style={{ borderColor: 'var(--glass-border-accent)', color: 'var(--primary)' }}
            >
              <Sparkles size={13} />
              {dataMode === 'loading' ? 'Đang kết nối dữ liệu' : dataMode === 'live' ? 'Dữ liệu cộng đồng' : 'Dữ liệu mẫu'}
            </div>
            <h2 className="brand-font text-3xl font-extrabold sm:text-4xl" style={{ color: 'var(--text-heading)' }}>
              Tìm Bạn Ở Ghép
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 sm:text-base" style={{ color: 'var(--text-muted)' }}>
              Khám phá hồ sơ phù hợp hoặc tham gia diễn đàn để tìm phòng và người ở ghép theo nhu cầu của bạn.
            </p>
          </div>

          <div
            className="inline-flex w-full rounded-2xl border p-1 sm:w-auto"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <button
              type="button"
              aria-pressed={viewMode === 'discover'}
              onClick={() => setViewMode('discover')}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors sm:flex-none"
              style={viewMode === 'discover' ? { background: 'var(--primary)', color: 'white' } : { color: 'var(--text-muted)' }}
            >
              <Heart size={16} />
              Khám phá
            </button>
            <button
              type="button"
              aria-pressed={viewMode === 'forum'}
              onClick={() => setViewMode('forum')}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors sm:flex-none"
              style={viewMode === 'forum' ? { background: 'var(--primary)', color: 'white' } : { color: 'var(--text-muted)' }}
            >
              <MessageCircle size={16} />
              Diễn đàn
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <label className="flex items-center gap-3 rounded-2xl border p-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}><MapPin size={18} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Khu vực</span>
              <select aria-label="Lọc theo khu vực" value={cityFilter} onChange={(event) => setCityFilter(event.target.value)} className="mt-0.5 w-full cursor-pointer bg-transparent text-sm font-bold outline-none" style={{ color: 'var(--text-heading)' }}>
                <option value="">Tất cả khu vực</option>
                <option value="TP.HCM">TP. Hồ Chí Minh</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
              </select>
            </span>
            <SlidersHorizontal className="shrink-0" size={15} style={{ color: 'var(--text-muted)' }} />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border p-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}><Wallet size={18} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Ngân sách</span>
              <select aria-label="Lọc theo ngân sách" value={budgetFilter} onChange={(event) => setBudgetFilter(event.target.value)} className="mt-0.5 w-full cursor-pointer bg-transparent text-sm font-bold outline-none" style={{ color: 'var(--text-heading)' }}>
                <option value="">Mọi mức giá</option>
                <option value="0-3000000">Dưới 3 triệu/tháng</option>
                <option value="3000000-5000000">3 – 5 triệu/tháng</option>
                <option value="5000000-8000000">5 – 8 triệu/tháng</option>
                <option value="8000000-999999999">Trên 8 triệu/tháng</option>
              </select>
            </span>
            <SlidersHorizontal className="shrink-0" size={15} style={{ color: 'var(--text-muted)' }} />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border p-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}><CalendarDays size={18} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Thời gian chuyển vào</span>
              <select aria-label="Lọc theo thời gian chuyển vào" value={moveInDays} onChange={(event) => setMoveInDays(event.target.value)} className="mt-0.5 w-full cursor-pointer bg-transparent text-sm font-bold outline-none" style={{ color: 'var(--text-heading)' }}>
                <option value="">Không giới hạn</option>
                <option value="7">Trong 7 ngày tới</option>
                <option value="30">Trong 30 ngày tới</option>
                <option value="60">Trong 60 ngày tới</option>
              </select>
            </span>
            {profilesLoading ? <Loader2 className="shrink-0 animate-spin" size={15} style={{ color: 'var(--primary)' }} /> : <SlidersHorizontal className="shrink-0" size={15} style={{ color: 'var(--text-muted)' }} />}
          </label>
        </div>

        {(cityFilter || budgetFilter || moveInDays) && (
          <div className="mt-3 flex items-center justify-between gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>{profilesLoading ? 'Đang áp dụng bộ lọc…' : `${profiles.length} hồ sơ phù hợp`}</span>
            <button type="button" onClick={() => { setCityFilter(''); setBudgetFilter(''); setMoveInDays(''); }} className="font-bold" style={{ color: 'var(--primary)' }}>Xóa bộ lọc</button>
          </div>
        )}
      </section>

      {dataMode === 'demo' && (
        <div className="rounded-2xl border px-4 py-3 text-xs" style={{ borderColor: 'var(--color-border-warning)', background: 'var(--color-bg-warning-soft)', color: 'var(--text-main)' }}>
          Supabase chưa sẵn sàng nên trang đang hiển thị dữ liệu mẫu. Sau khi áp dụng migration và cấu hình môi trường, dữ liệu thật sẽ tự động thay thế.
        </div>
      )}

      {createKind && (
        <RoommateCreatePanel kind={createKind} onClose={() => setCreateKind(null)} onCreated={addCreatedItem} />
      )}

      {viewMode === 'discover' ? (
        activeProfile ? (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card variant="glass" className="overflow-hidden p-3 sm:p-4">
            <div className="grid min-h-[460px] overflow-hidden rounded-[22px] border lg:grid-cols-[0.85fr_1.15fr]" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden p-8" style={{ background: activeProfile.color }}>
                <div aria-hidden="true" className="absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/20" />
                <div aria-hidden="true" className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-white/10" />
                <div className="relative text-center text-white">
                  <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full border-4 border-white/70 bg-white/15 text-5xl font-extrabold shadow-2xl backdrop-blur-md sm:h-44 sm:w-44 sm:text-6xl">
                    {activeProfile.initials}
                  </div>
                  <p className="mt-5 text-sm font-semibold text-white/80">{activeProfile.occupation}</p>
                </div>
                <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-extrabold" style={{ color: 'var(--primary-dark)' }}>
                  {activeProfile.match ? `${activeProfile.match}% phù hợp` : 'Hồ sơ cộng đồng'}
                </span>
              </div>

              <div className="flex flex-col p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="brand-font text-2xl font-extrabold" style={{ color: 'var(--text-heading)' }}>
                      {activeProfile.name}{activeProfile.age ? `, ${activeProfile.age}` : ''}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <MapPin size={14} />
                      {activeProfile.location}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={isSaved ? 'Bỏ lưu hồ sơ' : 'Lưu hồ sơ'}
                    onClick={() => void toggleSaved()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors"
                    style={isSaved ? { background: 'var(--primary)', borderColor: 'var(--primary)', color: 'white' } : { borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                  >
                    <Bookmark size={17} fill={isSaved ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <p className="mt-5 text-sm leading-6" style={{ color: 'var(--text-main)' }}>
                  {activeProfile.bio}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl p-4" style={{ background: 'var(--color-bg-soft-primary)' }}>
                    <Wallet size={18} style={{ color: 'var(--primary)' }} />
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Ngân sách</p>
                    <p className="mt-1 text-sm font-bold" style={{ color: 'var(--text-heading)' }}>{activeProfile.budget}</p>
                  </div>
                  <div className="rounded-2xl p-4" style={{ background: 'var(--accent-light)' }}>
                    <CalendarDays size={18} style={{ color: 'var(--accent)' }} />
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Chuyển vào</p>
                    <p className="mt-1 text-sm font-bold" style={{ color: 'var(--text-heading)' }}>{activeProfile.moveIn}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {activeProfile.habits.map((habit, index) => (
                    <span key={habit} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}>
                      {index === 0 ? <Moon size={12} /> : index === 1 ? <PawPrint size={12} /> : <UsersRound size={12} />}
                      {habit}
                    </span>
                  ))}
                </div>

                <div className="mt-auto grid grid-cols-[48px_1fr] gap-3 pt-6">
                  <button
                    type="button"
                    aria-label="Bỏ qua hồ sơ"
                    onClick={() => advanceProfile(1)}
                    className="flex h-12 items-center justify-center rounded-full border transition-colors hover:bg-[var(--color-bg-warning-soft)]"
                    style={{ borderColor: 'var(--border)', color: 'var(--danger)' }}
                  >
                    <X size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={handlePrimaryConnectionAction}
                    disabled={connectionBusy || activeConnection?.status === 'accepted' || (activeConnection?.status === 'pending' && activeConnection.direction === 'outgoing')}
                    className="flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-70 disabled:hover:translate-y-0"
                    style={{ background: activeConnection?.status === 'accepted' ? 'var(--dark)' : 'var(--gradient-primary)' }}
                  >
                    {connectionBusy ? <Loader2 size={17} className="animate-spin" /> : activeConnection?.status === 'accepted' ? <Check size={17} /> : <Heart size={17} />}
                    {connectionButtonLabel}
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <Card variant="surface" className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: 'var(--primary)' }}>Hồ sơ phù hợp</p>
                  <h3 className="brand-font mt-1 text-lg font-bold" style={{ color: 'var(--text-heading)' }}>Gợi ý cho bạn</h3>
                </div>
                <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}>
                  {profileIndex + 1}/{profiles.length}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {profiles.map((profile, index) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => setProfileIndex(index)}
                    className="flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors"
                    style={{
                      background: index === profileIndex ? 'var(--color-bg-soft-primary)' : 'var(--surface)',
                      borderColor: index === profileIndex ? 'var(--color-border-soft-primary)' : 'var(--border)',
                    }}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white" style={{ background: profile.color }}>
                      {profile.initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold" style={{ color: 'var(--text-heading)' }}>{profile.name}</span>
                      <span className="block truncate text-xs" style={{ color: 'var(--text-muted)' }}>{profile.location}</span>
                    </span>
                    <span className="text-xs font-extrabold" style={{ color: 'var(--primary)' }}>{profile.match ? `${profile.match}%` : 'Mới'}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 flex justify-between">
                <button type="button" aria-label="Hồ sơ trước" onClick={() => advanceProfile(-1)} className="flex h-9 w-9 items-center justify-center rounded-full border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  <ChevronLeft size={17} />
                </button>
                <button type="button" aria-label="Hồ sơ tiếp theo" onClick={() => advanceProfile(1)} className="flex h-9 w-9 items-center justify-center rounded-full border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  <ChevronRight size={17} />
                </button>
              </div>
              <button type="button" onClick={() => setCreateKind('profile')} className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-full border text-xs font-bold" style={{ borderColor: 'var(--color-border-soft-primary)', color: 'var(--primary)' }}>
                <Plus size={14} /> Tạo hoặc cập nhật hồ sơ
              </button>
            </Card>

            {connections.length > 0 && (
              <Card variant="surface" className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: 'var(--primary)' }}>Kết nối của bạn</p>
                    <h3 className="brand-font mt-1 text-lg font-bold" style={{ color: 'var(--text-heading)' }}>Lời mời & bạn ở ghép</h3>
                  </div>
                  <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}>
                    {connections.filter((connection) => connection.status === 'pending' && connection.direction === 'incoming').length} mới
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {connections.slice(0, 4).map((connection) => (
                    <div key={connection.id} className="rounded-2xl border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-white" style={{ background: 'var(--gradient-primary)' }}>
                          {initials(connection.profile.display_name)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold" style={{ color: 'var(--text-heading)' }}>{connection.profile.display_name}</p>
                          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            {connection.status === 'accepted' ? 'Đã kết nối' : connection.status === 'pending' ? (connection.direction === 'incoming' ? 'Đã gửi lời mời cho bạn' : 'Đang chờ phản hồi') : connection.status === 'declined' ? 'Đã từ chối' : 'Đã hủy'}
                          </p>
                        </div>
                      </div>

                      {connection.status === 'pending' && connection.direction === 'incoming' && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button type="button" disabled={connectionBusy} onClick={() => void updateConnection(connection, 'decline')} className="h-9 rounded-full border text-xs font-bold" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Từ chối</button>
                          <button type="button" disabled={connectionBusy} onClick={() => void updateConnection(connection, 'accept')} className="h-9 rounded-full text-xs font-bold text-white" style={{ background: 'var(--gradient-primary)' }}>Chấp nhận</button>
                        </div>
                      )}
                      {connection.status === 'pending' && connection.direction === 'outgoing' && (
                        <button type="button" disabled={connectionBusy} onClick={() => void updateConnection(connection, 'cancel')} className="mt-3 h-9 w-full rounded-full border text-xs font-bold" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Hủy lời mời</button>
                      )}
                      {connection.status === 'accepted' && (
                        <button type="button" disabled={connectionBusy} onClick={() => void updateConnection(connection, 'disconnect')} className="mt-3 h-9 w-full rounded-full border text-xs font-bold" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Kết thúc kết nối</button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card className="p-5" style={{ background: 'var(--dark)', color: 'white' }}>
              <Sparkles size={20} style={{ color: 'var(--warning)' }} />
              <h3 className="brand-font mt-3 text-lg font-bold">Độ tương hợp chi tiết</h3>
              <p className="mt-2 text-xs leading-5 text-white/70">
                Pro phân tích sâu hơn về ngân sách, giờ sinh hoạt và thói quen sống chung.
              </p>
              <span className="mt-4 inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold" style={{ background: 'var(--warning)', color: 'var(--dark-surface)' }}>
                PRO
              </span>
            </Card>
          </div>
        </section>
        ) : (
          <Card variant="glass" className="p-8 text-center">
            <UsersRound className="mx-auto" size={28} style={{ color: 'var(--primary)' }} />
            <h3 className="brand-font mt-3 text-xl font-bold" style={{ color: 'var(--text-heading)' }}>Chưa có hồ sơ công khai</h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Hãy là người đầu tiên tạo hồ sơ để cộng đồng có thể tìm thấy bạn.</p>
            <button type="button" onClick={() => setCreateKind('profile')} className="mt-5 rounded-full px-5 py-2.5 text-sm font-bold text-white" style={{ background: 'var(--gradient-primary)' }}><Plus className="mr-2 inline" size={15} />Tạo hồ sơ</button>
          </Card>
        )
      ) : (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={17} style={{ color: 'var(--text-muted)' }} />
                <input
                  aria-label="Tìm kiếm bài đăng"
                  placeholder="Tìm khu vực, mức giá hoặc nội dung bài đăng"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-12 w-full rounded-full border bg-[var(--surface)] pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
                />
              </div>
              <button type="button" onClick={() => setCreateKind('post')} className="flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold text-white" style={{ background: 'var(--gradient-primary)' }}>
                <Plus size={17} />
                Đăng bài tìm bạn
              </button>
            </div>

            {dataMode === 'loading' && <div className="flex items-center justify-center gap-2 py-12 text-sm" style={{ color: 'var(--text-muted)' }}><Loader2 className="animate-spin" size={18} />Đang tải bài viết…</div>}
            {filteredPosts.map((post) => (
              <Card key={post.id} variant="surface" className="p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white" style={{ background: 'var(--gradient-primary)' }}>
                    {post.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>{post.author}</span>
                      <span className="inline-flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Clock3 size={11} />
                        {post.time}
                      </span>
                    </div>
                    <h3 className="brand-font mt-3 text-lg font-bold sm:text-xl" style={{ color: 'var(--text-heading)' }}>{post.title}</h3>
                    <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-muted)' }}>{post.content}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary-dark)' }}>{tag}</span>
                      ))}
                    </div>

                    <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex flex-wrap gap-4 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                        <span className="inline-flex items-center gap-1.5"><MapPin size={13} />{post.location}</span>
                        <span className="inline-flex items-center gap-1.5"><Wallet size={13} />{post.budget}</span>
                      </div>
                      <span className="inline-flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--primary)' }}>
                        <MessageCircle size={14} />
                        {post.replies === null ? 'Bài viết cộng đồng' : `${post.replies} phản hồi`}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {dataMode !== 'loading' && filteredPosts.length === 0 && (
              <Card variant="surface" className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Không tìm thấy bài đăng phù hợp.</Card>
            )}
          </div>

          <div className="space-y-4">
            <Card variant="glass" className="p-5">
              <UsersRound size={21} style={{ color: 'var(--primary)' }} />
              <h3 className="brand-font mt-3 text-lg font-bold" style={{ color: 'var(--text-heading)' }}>Diễn đàn Tìm Bạn Ở Ghép</h3>
              <p className="mt-2 text-xs leading-5" style={{ color: 'var(--text-muted)' }}>
                Bài đăng được trình bày theo khu vực, ngân sách và nhu cầu để người dùng dễ tìm thấy nhau.
              </p>
            </Card>
            <Card variant="surface" className="p-5">
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>Chủ đề phổ biến</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Bình Thạnh', 'Quận 7', 'Phú Nhuận', 'Gần trường', 'Đi làm'].map((topic) => (
                  <span key={topic} className="rounded-full border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>{topic}</span>
                ))}
              </div>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
