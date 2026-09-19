export interface RoommateProfile {
  id: string;
  display_name: string;
  birth_year: number | null;
  occupation: string | null;
  city: string;
  district: string;
  budget_min: number;
  budget_max: number;
  move_in_date: string | null;
  bio: string;
  habits: string[];
  gender: 'female' | 'male' | 'other' | 'prefer_not_to_say';
  preferred_gender: 'female' | 'male' | 'other' | 'any';
  smoking: boolean;
  has_pets: boolean;
  avatar_url: string | null;
  is_discoverable: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoommatePost {
  id: string;
  author_name: string;
  title: string;
  content: string;
  city: string;
  district: string;
  budget_min: number;
  budget_max: number;
  move_in_date: string | null;
  tags: string[];
  status: 'draft' | 'published' | 'closed' | 'hidden';
  created_at: string;
  updated_at: string;
}

export interface RoommateBookmarks {
  profile_ids: string[];
  post_ids: string[];
}

export type RoommateConnectionStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface RoommateConnection {
  id: string;
  direction: 'incoming' | 'outgoing';
  status: RoommateConnectionStatus;
  message: string;
  profile: RoommateProfile;
  created_at: string;
  updated_at: string;
}
