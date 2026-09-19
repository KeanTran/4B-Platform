export type AppRole = 'admin' | 'user';

export interface CurrentUserAccess {
  userId: string | null;
  role: AppRole;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  display_name: string;
  role: AppRole;
  created_at: string;
}

