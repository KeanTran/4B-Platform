# 4B Platform

**Giải pháp chia chi phí phòng trọ sòng phẳng & êm đẹp**

![4B Logo](apps/web/public/logo.svg)

## Giới thiệu

4B là nền tảng quản lý phòng trọ và chia chi phí tự động cho sinh viên và người ở ghép. Với 4B, việc chia tiền điện, nước, internet trở nên công bằng và minh bạch.

## Tính năng

- **Tự động chia đều** chi phí cho các thành viên
- **VietQR 1-chạm** - Thanh toán nhanh chóng bằng mã QR
- **Nhắc nhở tự động** qua Zalo Bot (Mock)
- **AI hỗ trợ** trả lời câu hỏi về phân bổ chi phí
- **Quản lý nhiệm vụ** luân chuyển giữa các thành viên
- **Dark mode** hỗ trợ
- **Mobile-first** responsive design

## Tech Stack

### Frontend
- **Next.js 14** - App Router, Server Components, TypeScript strict
- **Tailwind CSS** - Utility-first CSS với CSS Variables
- **Zustand** - State management
- **React Hook Form + Zod** - Form validation
- **Sonner** - Toast notifications
- **Lucide React** - Icons

### Backend
- **Supabase** - Database, Auth, Realtime
- **Groq API** - AI Chat (free tier)

### Design
- **Lexend** - Brand font (headings)
- **Inter** - Body font
- **Font Awesome 6** - Icons
- **Mobile-first** responsive design

## Cài đặt

### Yêu cầu
- Node.js 18+
- pnpm 8+

### Setup

```bash
# Clone repository
git clone <repo-url>
cd landingp_page

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Fill in environment variables
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY

# Run development server
pnpm dev
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI (optional)
GROQ_API_KEY=your_groq_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Cấu trúc Project

```
apps/
  web/
    app/
      (marketing)/      # Landing page routes
        page.tsx       # Homepage
      (auth)/          # Authentication routes
        login/
        register/
      (dashboard)/     # Protected dashboard routes
        dashboard/
          page.tsx     # Overview
          split/       # Split expenses
          duties/      # Duty management
          ai/         # AI chat
          settings/    # User settings
    components/
      marketing/       # Landing page components
      shared/          # Shared components
    lib/
      supabase/        # Supabase clients
      vietqr.ts        # VietQR generator
      split.ts         # Split utilities
    store/             # Zustand stores
    types/             # TypeScript types
```

## Routes

| Route | Mô tả |
|-------|--------|
| `/` | Landing page |
| `/login` | Đăng nhập |
| `/register` | Đăng ký |
| `/dashboard` | Tổng quan |
| `/dashboard/split` | Chia chi phí |
| `/dashboard/duties` | Nhiệm vụ |
| `/dashboard/ai` | AI hỗ trợ |
| `/dashboard/settings` | Cài đặt |

## Development

```bash
# Run all apps
pnpm dev

# Build for production
pnpm build

# Lint
pnpm lint

# Type check
pnpm typecheck
```

## Database Schema

Xem `PLAN.md` để biết chi tiết về Supabase schema.

## Deployment

- **Frontend**: Vercel (free)
- **Database**: Supabase (free tier 500MB)
- **Domain**: paVietnam (.vn)

## Liên hệ

- Email: 4bforbetterbalance@gmail.com
- Facebook: https://www.facebook.com/share/1JFn1i3hji/

## License

MIT

---

**For Better Balance** 🏠
