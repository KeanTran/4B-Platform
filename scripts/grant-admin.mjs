import { createClient } from '@supabase/supabase-js';

const email = process.argv[2]?.trim().toLowerCase();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email) {
  console.error('Cách dùng: npm run admin:grant -- email@example.com');
  process.exit(1);
}

if (!url || !serviceRoleKey || url.includes('placeholder')) {
  console.error('Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (error) {
  console.error('Không thể đọc danh sách tài khoản:', error.message);
  process.exit(1);
}

const user = data.users.find((item) => item.email?.toLowerCase() === email);
if (!user) {
  console.error(`Không tìm thấy tài khoản ${email}.`);
  process.exit(1);
}

const { error: roleError } = await admin
  .from('user_roles')
  .upsert(
    { user_id: user.id, role: 'admin', assigned_by: null, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  );
if (roleError) {
  console.error('Không thể cấp quyền admin:', roleError.message);
  process.exit(1);
}

console.log(`Đã cấp quyền admin cho ${email}.`);
