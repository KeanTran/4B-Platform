# PLAN.md — Kế hoạch triển khai 4B Platform

## Mục lục
1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Tech Stack đã chốt](#2-tech-stack-đã-chốt)
3. [Phạm vi MVP](#3-phạm-vi-mvp)
4. [Lộ trình triển khai 30 ngày](#4-lộ-trình-triển-khai-30-ngày)
5. [Cấu trúc file cần tạo](#5-cấu-trúc-file-cần-tạo)
6. [Database Schema](#6-database-schema)
7. [API Endpoints](#7-api-endpoints)
8. [Acceptance Criteria](#8-acceptance-criteria)

---

## 1. Tổng quan dự án

**4B Platform** là nền tảng quản lý phòng trọ + chia chi phí thông minh dành cho sinh viên và người ở ghép Việt Nam. Mục tiêu của giai đoạn này: **tái tạo file `index.html` thành một web app full-stack hoàn chỉnh**, bao gồm:

- Landing page giống hệt 100% file gốc (4,298 lines)
- Hệ thống đăng ký / đăng nhập
- Dashboard với 5 tabs (Tổng Quan, Chia Tiền, Lịch Trực Nhật, AI, Cài Đặt)
- Database backend (PostgreSQL qua Supabase)
- Tích hợp AI (mock bằng Groq free tier)
- Mock Zalo OA Bot
- Deploy lên Vercel + Render, sử dụng domain miễn phí paVietnam

---

## 2. Tech Stack đã chốt

### 100% FREE — chi phí = 0 VND

```
Frontend:    Next.js 14 (App Router) + TypeScript strict + Tailwind CSS
Backend:     NestJS 10 + Prisma ORM (chạy song song, có thể dùng trực tiếp Supabase RPC)
Database:    Supabase (PostgreSQL free tier 500MB)
Auth:        Supabase Auth (email + Google + FB OAuth)
Realtime:    Supabase Realtime (live dashboard sync)
Storage:     Supabase Storage (1GB free)
Cache:       Upstash Redis (10K commands/day free)
Email:       Resend (100 emails/day free)
AI:          Groq API (free, 30 req/min)
VietQR:      Self-generate EMVCo payload (0 đồng)
Error track: Sentry (5K events/month free)
Uptime:      UptimeRobot (50 monitors free)
Deploy FE:   Vercel (free tier)
Deploy BE:   Render (free tier 750h/month)
Domain:      paVietnam (.vn free)
```

### Giới hạn cần biết
- **Render free tier**: spin down sau 15p không có traffic → cold start 30-60s
- **Supabase**: 500MB database, cần cleanup sau 6 tháng vận hành
- **Vercel**: 100GB bandwidth/tháng
- **Groq**: 30 requests/min (đủ cho demo + user nhỏ)
- **Resend**: 100 emails/day (production cần monitor)

---

## 3. Phạm vi MVP

### ✅ Có trong MVP
- [x] Landing page pixel-perfect với `index.html`
- [x] Auth flow (email + Google + FB)
- [x] Dashboard 5 tabs đầy đủ chức năng
- [x] VietQR generator (real EMVCo payload)
- [x] AI chatbot (Groq API)
- [x] Mock Zalo Bot service
- [x] Realtime sync (Supabase Realtime)
- [x] Mobile responsive
- [x] Dark mode
- [x] SEO + OpenGraph
- [x] Email verification + reset password

### ❌ Không có trong MVP
- [ ] Thanh toán thật (chỉ tạo QR, không verify payment)
- [ ] Multi-room management (1 user = 1 phòng trong MVP)
- [ ] Multi-language (chỉ tiếng Việt)
- [ ] Mobile native app
- [ ] Admin dashboard
- [ ] Analytics dashboard
- [ ] Email marketing

---

## 4. Lộ trình triển khai 30 ngày

### Day 1-2: Project Scaffolding
```bash
# Khởi tạo monorepo
mkdir 4b-platform && cd 4b-platform
pnpm init
pnpm add -D turbo
mkdir -p apps/web packages/shared-types

# Init Next.js
cd apps/web
pnpm create next-app@latest . --typescript --tailwind --app --eslint --src-dir=false --import-alias='@/*'
pnpm add zustand react-hook-form zod @hookform/resolvers

# Install Supabase
pnpm add @supabase/supabase-js @supabase/ssr

# Init NestJS (optional — có thể dùng Supabase RPC đơn giản hơn)
cd ../
pnpm create nest-app api --package-manager pnpm
cd api
pnpm add prisma @prisma/client
pnpm add -D prisma
```

**Output**:
- ✅ `apps/web/` chạy được `pnpm dev` (Next.js 14)
- ✅ `apps/api/` chạy được `pnpm start:dev` (NestJS)
- ✅ `packages/shared-types/` có types chung

---

### Day 3-7: Landing Page

**Mục tiêu**: Tái tạo 100% file `index.html` thành Next.js App Router.

#### Day 3: Setup tokens
- [ ] Convert CSS variables → `tailwind.config.ts` colors
- [ ] Setup `globals.css` với design tokens + dark mode
- [ ] Setup fonts (Lexend + Inter via `next/font`)
- [ ] Logo SVG component (hoặc `<img src="/logo.png">`)
- [ ] Header component (logo + nav + dark toggle + auth buttons)

#### Day 4: Hero + Stats + About
- [ ] Hero section (badge, title với gradient text, achievements, preview window)
- [ ] Stats bar (4 stats)
- [ ] About section (3 cards: Sứ mệnh, Khởi nguồn, Cam kết)

#### Day 5: Features + Pricing + Testimonials
- [ ] Features section (6 feature cards với hover animations)
- [ ] Pricing section (2 cards: Free vs Pro)
- [ ] Testimonials carousel (4 reviews)

#### Day 6: FAQ + Footer + Modals
- [ ] FAQ accordion (5 questions)
- [ ] Footer (4 columns + social links + email + Facebook)
- [ ] Modals: Terms of Service, Privacy Policy, Forgot Password, Demo Request

#### Day 7: SEO + Responsive + Polish
- [ ] SEO: meta tags, OpenGraph, Twitter Card, structured data (JSON-LD)
- [ ] `sitemap.xml` + `robots.txt`
- [ ] Mobile responsive (375px → 1024px+)
- [ ] Lighthouse audit target: >90 score

**Output**: Landing page trên `https://4b.vn/` giống hệt `index.html`

---

### Day 8-10: Authentication

#### Day 8: Supabase Auth Setup
```sql
-- Run trong Supabase SQL Editor
-- Tạo tables cho profiles, rooms
create table public.users (...);
create table public.rooms (...);
create table public.room_members (...);
```

- [ ] Tạo Supabase project
- [ ] Setup Supabase Auth (Email + Google OAuth + Facebook OAuth)
- [ ] Generate type-safe client (`pnpm gen types supabase`)
- [ ] Setup RLS policies (Row Level Security)

#### Day 9: Login/Register UI
- [ ] Login page (`/login`) — giữ nguyên layout từ `index.html`
- [ ] Register page (`/register`) — thêm fields: tên phòng, tên leader, số thành viên
- [ ] Forgot password page (`/forgot-password`)
- [ ] Verify email page (`/verify`)
- [ ] Social login buttons (Google, Facebook)

#### Day 10: Auth Logic + Middleware
- [ ] JWT session management (httpOnly cookies)
- [ ] `middleware.ts` redirect logic (chưa login → `/login`)
- [ ] Reset password flow (Resend + token)
- [ ] Logout + protected route guards

**Output**: User có thể đăng ký → verify email → đăng nhập → redirect dashboard

---

### Day 11-20: Dashboard Core

#### Day 11: Dashboard Shell
- [ ] Sidebar (logo + 5 nav buttons + bottom section)
- [ ] Top bar (title + action buttons)
- [ ] Tab content container
- [ ] Mobile responsive sidebar (overlay)

#### Day 12-13: Tab Tổng Quan
- [ ] 3 stat cards: Tổng hóa đơn, Đã thu hồi, Còn tồn đọng
- [ ] Member table (filter/sort)
- [ ] VietQR preview
- [ ] Alert warning (nếu vượt budget)

#### Day 14-15: Tab Chia Tiền
- [ ] 3 split mode buttons (Chia Đều / Tỷ Lệ / Số Ngày)
- [ ] Form nhập hóa đơn
- [ ] `splitEvenly()` algorithm
- [ ] Save expense vào DB
- [ ] Realtime update member table

#### Day 16-17: Tab Lịch Trực Nhật
- [ ] Calendar grid (28-31 ngày)
- [ ] Rotate duty algorithm
- [ ] CRUD duties
- [ ] Drag-and-drop đổi lịch (optional)

#### Day 18-19: Tab Cài Đặt
- [ ] Bank settings (10 VN banks dropdown)
- [ ] Notification settings (3 checkboxes)
- [ ] Monthly budget input
- [ ] Save to Supabase

#### Day 20: Realtime + Polish
- [ ] Supabase Realtime subscriptions
- [ ] Toast notifications
- [ ] Loading states
- [ ] Error handling

**Output**: Dashboard đầy đủ chức năng, realtime sync

---

### Day 21-25: AI + Notifications

#### Day 21-22: AI Chat (Groq)
- [ ] Setup Groq API client
- [ ] `POST /api/ai/chat` endpoint
- [ ] System prompt cho 4B AI
- [ ] Chat UI (FAB + sliding panel)
- [ ] Suggestion chips
- [ ] Persist chat logs to DB

#### Day 23: AI Insights Tab
- [ ] Tab "4B Student Pro AI"
- [ ] Forecast card (spending prediction)
- [ ] Savings suggestions card
- [ ] Quick insights (top spenders, trends)

#### Day 24: Mock Zalo Bot
- [ ] `MockZaloService` class
- [ ] `triggerZaloBot()` function
- [ ] Toast "Đã gửi Zalo nhắc nợ đến X thành viên"
- [ ] Log sent messages to DB

#### Day 25: Notifications System
- [ ] Notification bell icon (top bar)
- [ ] Dropdown với unread count
- [ ] Notification types: payment_reminder, budget_warning, duty_reminder, system
- [ ] Mark as read

**Output**: AI chat hoạt động, mock Zalo bot hoạt động, notifications hoạt động

---

### Day 26-30: Polish + Deploy

#### Day 26: Testing
- [ ] Vitest setup
- [ ] Unit tests: `splitEvenly()`, vietqr generator, supabase client
- [ ] Playwright setup
- [ ] E2E tests: register flow, create expense, split money

#### Day 27: Performance + A11y
- [ ] Lighthouse audit (target >90)
- [ ] Accessibility audit (axe)
- [ ] Bundle analysis
- [ ] Image optimization (next/image)

#### Day 28: Domain + Deploy
- [ ] Đăng ký `4b.vn` trên paVietnam
- [ ] DNS config (Vercel nameservers)
- [ ] SSL auto-cert
- [ ] Deploy production lên Vercel
- [ ] Deploy backend lên Render

#### Day 29: Monitoring + SEO
- [ ] Sentry setup
- [ ] UptimeRobot monitor
- [ ] Google Search Console submit
- [ ] Submit sitemap.xml

#### Day 30: Documentation + Handoff
- [ ] README.md (overview + setup instructions)
- [ ] API documentation (Swagger từ NestJS)
- [ ] Architecture diagram
- [ ] Handoff cho người maintain

**Output**: Production-ready web app trên `https://4b.vn`

---

## 5. Cấu trúc file cần tạo

```
4b-platform/
├── .github/
│   └── workflows/
│       ├── ci.yml                       # Run tests + build
│       └── deploy.yml                   # Auto-deploy to Vercel + Render
├── apps/
│   ├── web/                              # Next.js 14
│   │   ├── app/
│   │   │   ├── (marketing)/             # Landing page routes
│   │   │   │   ├── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── components/
│   │   │   │       ├── Header.tsx
│   │   │   │       ├── Hero.tsx
│   │   │   │       ├── StatsBar.tsx
│   │   │   │       ├── About.tsx
│   │   │   │       ├── Features.tsx
│   │   │   │       ├── Pricing.tsx
│   │   │   │       ├── Testimonials.tsx
│   │   │   │       ├── FAQ.tsx
│   │   │   │       ├── Footer.tsx
│   │   │   │       ├── Modals.tsx
│   │   │   │       └── DarkModeToggle.tsx
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── register/page.tsx
│   │   │   │   ├── forgot-password/page.tsx
│   │   │   │   └── verify-email/page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   └── dashboard/
│   │   │   │       ├── layout.tsx
│   │   │   │       ├── overview/page.tsx
│   │   │   │       ├── split/page.tsx
│   │   │   │       ├── duty/page.tsx
│   │   │   │       ├── ai/page.tsx
│   │   │   │       └── settings/page.tsx
│   │   │   ├── api/
│   │   │   │   ├── ai/chat/route.ts
│   │   │   │   ├── vietqr/route.ts
│   │   │   │   ├── zalo/trigger/route.ts
│   │   │   │   └── auth/callback/route.ts
│   │   │   ├── layout.tsx
│   │   │   ├── not-found.tsx
│   │   │   └── sitemap.ts
│   │   ├── components/
│   │   │   ├── ui/                       # shadcn primitives
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── modal.tsx
│   │   │   │   └── toast.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── TopBar.tsx
│   │   │   │   ├── StatsCards.tsx
│   │   │   │   ├── MemberTable.tsx
│   │   │   │   ├── VietQRPreview.tsx
│   │   │   │   ├── ExpenseForm.tsx
│   │   │   │   ├── DutyCalendar.tsx
│   │   │   │   ├── AiInsights.tsx
│   │   │   │   ├── BankSettings.tsx
│   │   │   │   └── NotificationBell.tsx
│   │   │   ├── ai-chat/
│   │   │   │   ├── AiChatFab.tsx
│   │   │   │   └── AiChatPanel.tsx
│   │   │   └── shared/
│   │   │       └── BrandLogo.tsx
│   │   ├── lib/
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts
│   │   │   │   └── server.ts
│   │   │   ├── vietqr.ts                 # Self-generate EMVCo
│   │   │   ├── split.ts                  # splitEvenly()
│   │   │   ├── utils.ts
│   │   │   └── validators/                # Zod schemas
│   │   ├── stores/
│   │   │   ├── app-store.ts              # Zustand
│   │   │   └── ui-store.ts
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── types/
│   │   │   ├── database.ts               # Generated from Supabase
│   │   │   └── shared.ts
│   │   ├── public/
│   │   │   ├── logo.png                  # User-provided logo
│   │   │   ├── favicon.ico
│   │   │   ├── og-image.png
│   │   │   └── hero-preview.svg
│   │   ├── middleware.ts
│   │   ├── tailwind.config.ts
│   │   ├── next.config.ts
│   │   └── package.json
│   └── api/                              # NestJS (optional)
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── rooms/
│       │   │   ├── expenses/
│       │   │   ├── duties/
│       │   │   ├── vietqr/
│       │   │   ├── ai/
│       │   │   └── zalobot/
│       │   ├── common/
│       │   ├── config/
│       │   ├── database/
│       │   └── main.ts
│       ├── prisma/
│       │   └── schema.prisma
│       └── package.json
├── packages/
│   ├── shared-types/
│   │   ├── src/
│   │   │   ├── auth.ts
│   │   │   ├── room.ts
│   │   │   ├── expense.ts
│   │   │   └── index.ts
│   │   └── package.json
│   └── design-tokens/
│       ├── src/
│       │   └── tokens.ts
│       └── package.json
├── public/
│   └── (chỉ root level public assets)
├── .env.example
├── .gitignore
├── docker-compose.yml                     # Local dev only
├── turbo.json
├── package.json
├── tsconfig.base.json
├── CLAUDE.md
├── PLAN.md
└── README.md
```

---

## 6. Database Schema (Supabase PostgreSQL)

```sql
-- ========================================
-- USERS (extends Supabase auth.users)
-- ========================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null,
  avatar_url text,
  provider text default 'email' check (provider in ('email','google','facebook')),
  email_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ========================================
-- ROOMS
-- ========================================
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique default substring(md5(random()::text), 1, 8),
  leader_id uuid references public.users(id) on delete set null,
  monthly_budget int default 2000000,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ========================================
-- ROOM MEMBERS
-- ========================================
create table public.room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  role text default 'member' check (role in ('leader','member')),
  display_name text not null,
  ratio float default 1.0,
  days_stayed int default 30,
  joined_at timestamptz default now(),
  unique(room_id, user_id)
);

-- ========================================
-- EXPENSES
-- ========================================
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  title text not null,
  total_amount int not null,
  split_mode text default 'equal' check (split_mode in ('equal','ratio','days')),
  paid_by_id uuid references public.room_members(id) on delete set null,
  expense_date date default current_date,
  created_by_id uuid references public.users(id),
  created_at timestamptz default now()
);

-- ========================================
-- EXPENSE ALLOCATIONS
-- ========================================
create table public.expense_allocations (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid references public.expenses(id) on delete cascade,
  member_id uuid references public.room_members(id) on delete cascade,
  amount_due int not null,
  amount_paid int default 0,
  paid_at timestamptz,
  qr_payload text
);

-- ========================================
-- DUTIES
-- ========================================
create table public.duties (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  member_id uuid references public.room_members(id) on delete set null,
  duty_date date not null,
  task text not null,
  status text default 'pending' check (status in ('pending','done','skipped')),
  created_at timestamptz default now()
);

-- ========================================
-- BANK SETTINGS
-- ========================================
create table public.bank_settings (
  room_id uuid primary key references public.rooms(id) on delete cascade,
  bank_code text not null,
  bank_name text not null,
  account_number text not null,
  account_holder text not null,
  updated_at timestamptz default now()
);

-- ========================================
-- NOTIFICATIONS
-- ========================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  type text check (type in ('payment_reminder','budget_warning','duty_reminder','system')),
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- ========================================
-- AI CHAT LOGS
-- ========================================
create table public.ai_chat_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  role text check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================
alter table public.users enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_allocations enable row level security;
alter table public.duties enable row level security;
alter table public.bank_settings enable row level security;
alter table public.notifications enable row level security;
alter table public.ai_chat_logs enable row level security;

-- Users can view own profile
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

-- Users can view rooms they belong to
create policy "Members can view their rooms" on public.rooms
  for select using (
    exists (
      select 1 from public.room_members
      where room_members.room_id = rooms.id
      and room_members.user_id = auth.uid()
    )
  );

-- (More RLS policies — add per table as needed)
```

---

## 7. API Endpoints

### Frontend API Routes (Next.js)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/me` | Get current user | ✅ |
| POST | `/api/vietqr` | Generate VietQR payload | ✅ |
| POST | `/api/ai/chat` | Chat với 4B AI | ✅ |
| POST | `/api/zalo/trigger` | Mock trigger Zalo bot | ✅ |
| GET | `/api/notifications` | Get user notifications | ✅ |
| PATCH | `/api/notifications/:id/read` | Mark as read | ✅ |
| GET | `/api/og-image` | Generate OG image | ❌ |
| GET | `/sitemap.xml` | SEO sitemap | ❌ |
| POST | `/api/auth/callback` | OAuth callback | ❌ |

### Direct Supabase Queries (from frontend)
Most operations use Supabase client directly:
- Auth: `supabase.auth.signIn()`, `signUp()`, `signOut()`
- CRUD rooms, members, expenses: `supabase.from('rooms').select()`, etc.
- Realtime: `supabase.channel('room_1').on('postgres_changes', ...)`

### NestJS Backend (Optional — nếu cần custom logic)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/register` | Custom register flow |
| POST | `/auth/login` | Custom login |
| POST | `/auth/refresh` | Refresh JWT |
| GET | `/rooms/:id/dashboard` | Aggregate dashboard data |
| POST | `/expenses/allocate` | Server-side allocation logic |
| POST | `/vietqr/generate` | VietQR generation |
| POST | `/ai/chat` | AI chat proxy |
| POST | `/zalo/send-reminder` | Mock Zalo sender |
| GET | `/notifications` | User notifications |

---

## 8. Acceptance Criteria

### Phase 2: Landing Page ✅
- [ ] Visual giống hệt `index.html` (so sánh screenshot, target 99%+ match)
- [ ] All sections render: Header, Hero, Stats, About, Features, Pricing, Testimonials, FAQ, Footer
- [ ] Dark mode toggle hoạt động
- [ ] Mobile responsive: 375px / 768px / 1024px+ đều đẹp
- [ ] Lighthouse score: Performance >90, Accessibility >95, SEO >95
- [ ] All modals mở/đóng đúng
- [ ] FAQ accordion expand/collapse
- [ ] Pricing toggle annual/monthly (nếu có)

### Phase 3: Auth ✅
- [ ] Đăng ký bằng email → nhận email verify
- [ ] Click link verify → active account
- [ ] Đăng nhập với email/password → redirect dashboard
- [ ] Login với Google → callback → dashboard
- [ ] Login với Facebook → callback → dashboard
- [ ] Forgot password → email → reset → login
- [ ] Middleware protect `/dashboard/*` routes
- [ ] Logout clears session

### Phase 4: Dashboard ✅
- [ ] Sidebar 5 tabs navigate đúng
- [ ] Tab Tổng Quan: 3 stat cards + member table + VietQR
- [ ] Tab Chia Tiền: 3 split modes → calculate correctly
- [ ] Tab Lịch Trực Nhật: calendar + CRUD + rotate
- [ ] Tab AI: insights cards hiển thị
- [ ] Tab Cài Đặt: bank settings saved correctly
- [ ] VietQR thực sự quét được bằng app ngân hàng
- [ ] Realtime sync: tab khác update → tab này update

### Phase 5: AI + Notifications ✅
- [ ] FAB click → panel mở với animation
- [ ] Chat với AI → response trong <3s
- [ ] Suggestion chips click → auto-fill
- [ ] Trigger Zalo Bot → toast "Đã gửi X messages"
- [ ] Notification bell → dropdown hiển thị
- [ ] Mark as read → update UI

### Phase 6: Polish + Deploy ✅
- [ ] All tests pass (Vitest + Playwright)
- [ ] Lighthouse >90 all categories
- [ ] WCAG AA compliant
- [ ] Production URL `https://4b.vn` live
- [ ] SSL active (HTTPS)
- [ ] Sentry capture errors
- [ ] UptimeRobot ping success

---

## 9. Key Algorithms

### splitEvenly()
```ts
function splitEvenly(total: number, count: number): number[] {
  if (!count || count <= 0) return [];
  const base = Math.floor(total / count);
  const remainder = total - base * count;
  const amounts = new Array(count).fill(base);
  // Spread the remainder VND to the first N members
  for (let i = 0; i < remainder; i++) amounts[i] += 1;
  return amounts;
}

// Example: split 10000 VND / 3 members
// → [3334, 3333, 3333] (sum = 10000, no floating-point errors)
```

### VietQR EMVCo Payload
```ts
// Self-generate, no API needed
// Spec: https://www.emvco.com/wp-content/uploads/2023/06/EMVCo-Merchant-Presented-QR-Specification-v1.1.pdf
function buildVietQR({
  bankBin,        // 6-digit bank BIN
  accountNumber,  // Account number
  amount,         // VND
  memo,           // "4B PHONG302 DONGTIEN"
}) {
  // Build TLV (Tag-Length-Value) string per EMVCo spec
  // CRC-16 checksum at end
  // Output: Vietnamese banking app scans → auto-fill
}
```

### AI System Prompt
```ts
const SYSTEM_PROMPT = `
Bạn là 4B AI Assistant — trợ lý ảo của nền tảng 4B (For Better Balance).

Nhiệm vụ: Hỗ trợ người dùng về cách sử dụng nền tảng quản lý phòng trọ 4B.

Tính năng của 4B:
- Chia tiền phòng trọ tự động (chia đều/theo tỷ lệ/theo số ngày ở)
- VietQR 1-chạm (mã QR khớp chính xác số tiền)
- Zalo Bot nhắc nợ tự động
- AI dự báo chi phí
- Lịch trực nhật xoay vòng

Phong cách: Thân thiện, dùng emoji phù hợp, trả lời ngắn gọn (tối đa 3 đoạn), tiếng Việt.

Câu hỏi thường gặp:
1. Cách tạo phòng: Vào /register, điền tên phòng + email + password
2. Chia tiền: Tab "Chia Tiền", chọn mode, nhập số tiền
3. VietQR: Tab "Tổng Quan", mỗi thành viên có 1 QR riêng
4. Zalo Bot: Click nút "Zalo Bot Nhắc" trên top bar
5. Quên mật khẩu: Click "Quên mật khẩu?" tại /login
`;
```

---

## 10. Risks + Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Render free tier spin down | UX: 30-60s delay | Show loading skeleton; consider upgrading to $7/month when traffic grows |
| Supabase 500MB limit | Data cap | Implement monthly cleanup job; archive old logs |
| Groq API quota | AI downtime | Fallback to canned responses when API down |
| Zalo mock instead of real | Limited functionality | Doc clearly states mock; provide setup guide for real Zalo OA |
| Domain DNS slow propagation | Initial deploy | Use Cloudflare DNS in future; paVietnam takes 24-48h |
| Lighthouse mobile <90 | SEO penalty | Image optimization, defer non-critical JS, font subsetting |

---

## 11. Future Scope (Post-MVP)

- [ ] Multi-room per user
- [ ] Real Zalo OA integration (after OA registration)
- [ ] Real payment verification (after VietQR callback)
- [ ] Mobile app (React Native + Expo)
- [ ] Analytics dashboard
- [ ] Export data (Excel/PDF)
- [ ] Multi-language (English)
- [ ] Subscription plan (Pro tier with payment via Stripe/VNPay)

---

**Plan version**: 1.0
**Last updated**: 2026-09-05
**Estimated effort**: 30 working days (1 developer)
**Estimated cost**: $0 (free tiers) + ~30 days of work
