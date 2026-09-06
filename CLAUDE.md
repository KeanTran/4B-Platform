# CLAUDE.md — 4B Platform

> **For Better Balance** — Nền tảng quản lý phòng trọ, chia chi phí thông minh dành cho sinh viên & người ở ghép Việt Nam.

---

## 🎯 Brand Identity

| Attribute | Value |
|-----------|-------|
| **Tên thương hiệu** | 4B |
| **Slogan** | For better balance |
| **Email liên hệ** | 4bforbetterbalance@gmail.com |
| **Facebook** | https://www.facebook.com/share/1JFn1i3hji/?mibextid=wwXIfr |
| **Logo file** | Logo 4B (hình ảnh đính kèm — ngôi nhà màu xanh lá + cửa cam) |
| **Logo format** | SVG được tách từ `<img>` reference |

### Color Palette (Primary Tokens)
```
--primary:        #3f7f12  (Xanh lá đậm — primary brand)
--primary-dark:   #2d5c0d  (Xanh lá rất đậm)
--primary-light:  #d4ee7d  (Xanh lá nhạt — soft primary)
--bg-light:       #fffdea  (Kem nhạt — light mode bg)
--accent:         #f9a23d  (Cam — call-to-action)
--accent-light:   #ffe8cd  (Cam nhạt)
--warning:        #fff08c  (Vàng nhạt)
--dark:           #754827  (Nâu đậm — text headings)
--danger:         #d9381e  (Đỏ — alerts)
--text-main:      #332113  (Nâu đen — body text)
--text-muted:     #826653  (Nâu nhạt — secondary text)
```

### Typography
- **Headings**: `Lexend` (Google Fonts, weights 500/600/700/800)
- **Body**: `Inter` (Google Fonts, weights 300/400/500/600/700)

---

## 🚀 Tech Stack — 100% FREE

### Frontend
- **Next.js 14** (App Router) + **TypeScript** (strict mode)
- **Tailwind CSS** + CSS variables (design tokens from `index.html`)
- **Zustand** (lightweight state management)
- **React Hook Form** + **Zod** (form validation)
- **shadcn/ui** base (Radix UI primitives)

### Backend / BaaS
- **Supabase** (PostgreSQL + Auth + Realtime + Storage)
- **Prisma** ORM (type-safe queries)
- **NestJS** (TypeScript backend REST API)
- **JWT + Supabase Auth** (token verification)

### Database
- **PostgreSQL** (via Supabase free tier — 500MB)
- Tables: `users`, `rooms`, `room_members`, `expenses`, `expense_allocations`, `duties`, `bank_settings`, `notifications`, `ai_chat_logs`

### AI & External Services (Free tier)
- **Groq API** (free — AI chatbot, 30 req/min)
- **Resend** (free — email, 100/day)
- **Upstash Redis** (free — caching, 10K commands/day)
- **VietQR** (self-generate EMVCo payload — no API needed)
- **Sentry** (free — error tracking, 5K events/month)

### Deployment (All Free)
- **Frontend**: Vercel (free tier)
- **Backend**: Render (free tier, 750h/month)
- **Domain**: paVietnam (.vn free)

### Mock (không cần đăng ký thật)
- **Zalo OA Bot**: mock nội bộ qua `MockZaloService` — không cần đăng ký OA thật

---

## 📁 Project Structure (Turborepo Monorepo)

```
4b-platform/
├── apps/
│   ├── web/                          # Next.js 14 frontend
│   │   ├── app/
│   │   │   ├── (marketing)/         # Landing page
│   │   │   │   ├── page.tsx        # Trang chủ
│   │   │   │   ├── layout.tsx
│   │   │   │   └── components/     # Header, Hero, Features, Pricing, FAQ, Footer
│   │   │   ├── (auth)/              # Login + Register
│   │   │   ├── (dashboard)/         # Protected dashboard
│   │   │   │   └── dashboard/
│   │   │   │       ├── overview/    # Tab 1
│   │   │   │       ├── split/       # Tab 2
│   │   │   │       ├── duty/        # Tab 3
│   │   │   │       ├── ai/          # Tab 4
│   │   │   │       └── settings/    # Tab 5
│   │   │   └── api/                 # API routes (webhook, og-image)
│   │   ├── components/
│   │   ├── lib/                     # supabase client, utils, types
│   │   ├── stores/                  # Zustand stores
│   │   ├── styles/                  # globals.css + tokens
│   │   └── middleware.ts            # Auth middleware
│   └── api/                         # NestJS backend (optional — can use Supabase directly)
├── packages/
│   ├── shared-types/                # Shared TypeScript types/DTOs
│   └── design-tokens/               # CSS tokens → TS constants
├── .env.example
├── docker-compose.yml               # Local dev (Postgres)
├── turbo.json
├── package.json                     # Root workspace
└── tsconfig.base.json
```

---

## 🎨 Design System Conventions

### CSS Variables → Tailwind
All CSS variables from `index.html` are mapped into `tailwind.config.ts` under `theme.extend.colors`. Example:

```ts
// tailwind.config.ts
colors: {
  brand: {
    primary: 'var(--primary)',
    'primary-dark': 'var(--primary-dark)',
    'primary-light': 'var(--primary-light)',
    accent: 'var(--accent)',
    warning: 'var(--warning)',
    dark: 'var(--dark)',
    danger: 'var(--danger)',
  },
  surface: 'var(--surface)',
  bg: {
    light: 'var(--bg-light)',
  }
}
```

### Component Naming
- **UI primitives**: PascalCase, prefixed by purpose: `ButtonPrimary`, `CardDark`, `BadgeWarning`
- **Section components**: `Hero`, `FeatureGrid`, `PricingSection`
- **Dashboard tabs**: `OverviewTab`, `SplitTab`, `DutyTab`, `AiTab`, `SettingsTab`
- **Modals**: `LoginModal`, `RegisterModal`, `ForgotPasswordModal`, `TermsModal`, `PrivacyModal`

### File Organization
- One component per file
- Group by feature, not by type (e.g., `dashboard/overview/` not `components/cards/`)
- Co-locate styles, types, tests with the component

---

## 📜 Code Style Guidelines

### TypeScript
- **Strict mode always**: `strict: true` in `tsconfig.base.json`
- **No `any`**: use `unknown` and narrow
- **Explicit return types** for exported functions
- **Prefer `type` over `interface`** for object shapes
- **Branded types** for IDs: `type UserId = string & { __brand: 'UserId' }`

### React / Next.js
- **Server Components by default**; add `'use client'` only when needed (forms, interactions)
- **Use `next/image`** for all images
- **Use `next/font`** for Google Fonts (Lexend + Inter)
- **Dynamic imports** for dashboard charts, heavy widgets
- **Forms**: React Hook Form + Zod schema
- **State**: Zustand for global, `useState` for local

### Styling
- **Tailwind utility-first**; avoid inline styles (only use for dynamic values)
- **CSS variables** in `globals.css` for tokens that change with theme
- **Dark mode**: `dark:` Tailwind variant + `[data-theme="dark"]` selector
- **Mobile-first**: design for 375px first, then scale up

### Database / API
- **Snake_case** for DB columns (`room_id`, `total_amount`)
- **camelCase** for TS properties (`roomId`, `totalAmount`)
- **Prisma handles the conversion** automatically
- **API responses**: wrapped in `{ data, error, message }` envelope

---

## 🌍 Localization

- **Default locale**: `vi-VN` (Vietnamese)
- **HTML lang**: `vi`
- **Number formatting**: Use `Intl.NumberFormat('vi-VN')` for VND (no decimals)
- **Date formatting**: Use `Intl.DateTimeFormat('vi-VN')`
- **Currency**: All amounts in VND (integer, no decimals)

```ts
const vndFormatter = new Intl.NumberFormat('vi-VN');
vndFormatter.format(1200000); // "1.200.000"
```

---

## 🔐 Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...                # Server-side only
NEXT_PUBLIC_APP_URL=https://4b.vn
GROQ_API_KEY=gsk_...
RESEND_API_KEY=re_...

# Backend (if using NestJS)
DATABASE_URL=postgresql://...
JWT_SECRET=...
PORT=3001
```

---

## 🧪 Testing Strategy

| Layer | Tool | Coverage Goal |
|-------|------|---------------|
| Unit | Vitest | >70% |
| E2E | Playwright | Key user flows |
| Visual | Playwright screenshots | Layout regression |
| Type | TypeScript strict | 100% typed |

---

## 📋 Implementation Order (Phased)

### Phase 1 — Project Scaffolding (Day 1-2)
1. ✅ Init Turborepo + pnpm workspace
2. ✅ Init Next.js app with TypeScript strict
3. ✅ Setup Tailwind config với design tokens từ `index.html`
4. ✅ Setup Supabase project + schema migration
5. ✅ Setup CI/CD (GitHub Actions → Vercel + Render)

### Phase 2 — Landing Page (Day 3-7)
Mục tiêu: Tái tạo 100% giao diện `index.html`
1. ✅ Header + Dark mode toggle + Mobile menu
2. ✅ Hero section (badge, title, achievements, preview window)
3. ✅ Stats bar
4. ✅ About section (Sứ mệnh, Khởi nguồn, Cam kết)
5. ✅ Features section (6 cards)
6. ✅ Pricing section (Free vs Pro)
7. ✅ Testimonials carousel
8. ✅ FAQ accordion
9. ✅ Footer
10. ✅ Modals: ToS, Privacy, Forgot Password, Demo Request
11. ✅ SEO meta tags + OpenGraph + sitemap.xml
12. ✅ Responsive mobile-first

### Phase 3 — Auth Flow (Day 8-10)
1. ✅ Supabase Auth setup (email + Google + FB OAuth)
2. ✅ Login page + Register page
3. ✅ Email verification flow (Resend)
4. ✅ Forgot password / Reset password
5. ✅ JWT session management (httpOnly cookies)
6. ✅ Protected routes via Next.js middleware

### Phase 4 — Dashboard Core (Day 11-20)
1. ✅ Dashboard layout + sidebar
2. ✅ Tab Tổng Quan (stat cards + member table + VietQR preview)
3. ✅ Tab Chia Tiền (3 split modes: equal/ratio/days)
4. ✅ VietQR generator (EMVCo self-generate, no API)
5. ✅ Tab Lịch Trực Nhật (calendar + CRUD + rotate)
6. ✅ Tab Cài Đặt (bank info 10 VN banks + notifications + budget)
7. ✅ Realtime sync via Supabase Realtime

### Phase 5 — AI + Notifications (Day 21-25)
1. ✅ AI Chat (Groq API integration)
2. ✅ AI insights tab (forecast + suggestions)
3. ✅ Mock Zalo Bot service
4. ✅ In-app notification bell + dropdown
5. ✅ Budget warning alerts (20% threshold)

### Phase 6 — Polish + Deploy (Day 26-30)
1. ✅ Unit tests (Vitest)
2. ✅ E2E tests (Playwright) — key flows
3. ✅ Lighthouse audit (>90 score)
4. ✅ Accessibility audit (axe — WCAG AA)
5. ✅ Domain setup (paVietnam) + DNS
6. ✅ Social meta + share cards
7. ✅ Sentry error tracking
8. ✅ UptimeRobot monitoring
9. ✅ README + handoff documentation

---

## 🧠 Key Constraints

1. **Không vượt quá scope**: chỉ làm những gì user yêu cầu trong prompt
2. **TypeScript strict 100%**: không `any`, không `// @ts-ignore`
3. **Zalo OA mock**: không cần đăng ký OA thật, mock trong code
4. **Miễn phí 100%**: không dùng service nào trả phí
5. **Vietnamese-first**: UI mặc định tiếng Việt
6. **Match design 100%**: pixel-perfect với file `index.html` gốc
7. **Logo file**: dùng `<img src="/logo.png">` tham chiếu file ảnh user cung cấp

---

## 🚫 Don'ts

- ❌ Đừng tạo components không cần thiết (no over-engineering)
- ❌ Đừng dùng `any` type — luôn dùng `unknown` hoặc type cụ thể
- ❌ Đừng hardcode colors — luôn dùng design tokens
- ❌ Đừng commit `.env` files
- ❌ Đừng tạo file mà không có mục đích rõ ràng (clean-code principle)
- ❌ Đừng bỏ qua accessibility (aria labels, keyboard nav, focus states)

---

## 📚 Reference Links

- File gốc: `index.html` (4,298 lines, 269KB)
- Logo: `public/logo.png` (user-provided 4B logo)
- Brand email: 4bforbetterbalance@gmail.com
- Facebook page: https://www.facebook.com/share/1JFn1i3hji/?mibextid=wwXIfr

---

## 🧾 Versioning

- Node.js: **v20 LTS**
- pnpm: **v9**
- Next.js: **14.2.x**
- NestJS: **10.x**
- Supabase JS: **v2**
- Prisma: **5.x**

---

**Tạo bởi**: Claude (Anthropic)
**Cập nhật lần cuối**: 2026-09-05
**Trạng thái**: 🔨 Đang triển khai
