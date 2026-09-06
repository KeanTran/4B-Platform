// Database types for 4B Platform

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  zalo_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  name: string;
  address: string | null;
  owner_id: string;
  invite_code: string;
  created_at: string;
  updated_at: string;
}

export interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  nickname: string | null;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  user?: User;
}

export interface Expense {
  id: string;
  room_id: string;
  created_by: string;
  title: string;
  amount: number;
  category: 'rent' | 'electric' | 'water' | 'internet' | 'other';
  due_date: string | null;
  paid_by: string;
  paid_at: string | null;
  status: 'pending' | 'partial' | 'paid';
  created_at: string;
  updated_at: string;
  allocations?: ExpenseAllocation[];
}

export interface ExpenseAllocation {
  id: string;
  expense_id: string;
  member_id: string;
  amount: number;
  status: 'pending' | 'paid';
  paid_at: string | null;
  payment_method: 'vietqr' | 'cash' | 'transfer' | null;
  created_at: string;
  member?: RoomMember;
}

export interface Duty {
  id: string;
  room_id: string;
  title: string;
  description: string | null;
  assigned_to: string;
  due_date: string | null;
  rotation_type: 'none' | 'weekly' | 'monthly' | 'custom';
  status: 'pending' | 'completed' | 'skipped';
  created_at: string;
  updated_at: string;
  assignee?: RoomMember;
}

export interface BankSetting {
  id: string;
  user_id: string;
  bank_bin: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'expense' | 'duty' | 'payment' | 'system';
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

export interface AIChatLog {
  id: string;
  user_id: string;
  room_id: string | null;
  message: string;
  response: string;
  tokens_used: number | null;
  created_at: string;
}

// Form types
export interface CreateRoomForm {
  name: string;
  address?: string;
}

export interface AddExpenseForm {
  title: string;
  amount: number;
  category: Expense['category'];
  due_date?: string;
  split_type: 'evenly' | 'custom' | 'percentage';
  allocations?: { member_id: string; amount: number }[];
}

export interface CreateDutyForm {
  title: string;
  description?: string;
  assigned_to: string;
  due_date?: string;
  rotation_type: Duty['rotation_type'];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
