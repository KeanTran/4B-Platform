export const SUPPORT_STATUSES = ['new', 'in_progress', 'resolved', 'spam'] as const;

export type SupportStatus = (typeof SUPPORT_STATUSES)[number];

export interface AdminSupportMessage {
  id: string;
  user_id: string | null;
  email: string;
  phone: string | null;
  message: string;
  source_path: string | null;
  status: SupportStatus;
  admin_note: string | null;
  handled_by: string | null;
  handled_at: string | null;
  created_at: string;
  updated_at: string;
}
