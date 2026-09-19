import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export const PROFILE_PUBLIC_FIELDS =
  'id, display_name, birth_year, occupation, city, district, budget_min, budget_max, move_in_date, bio, habits, gender, preferred_gender, smoking, has_pets, avatar_url, is_discoverable, created_at, updated_at';

export const POST_PUBLIC_FIELDS =
  'id, author_name, title, content, city, district, budget_min, budget_max, move_in_date, tags, status, created_at, updated_at';

export function apiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Dữ liệu chưa hợp lệ.', issues: error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const message = error instanceof Error ? error.message : 'Lỗi hệ thống';
  const unavailable = message.includes('chưa được cấu hình');
  return NextResponse.json(
    { error: unavailable ? message : 'Không thể xử lý yêu cầu lúc này.' },
    { status: unavailable ? 503 : 500 },
  );
}

export function queryLimit(value: string | null) {
  const parsed = Number(value ?? 20);
  return Number.isInteger(parsed) ? Math.min(Math.max(parsed, 1), 50) : 20;
}

