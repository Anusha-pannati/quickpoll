export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

export interface PollOption {
  id: number;
  poll_id: number;
  text: string;
  vote_count: number;
}

export interface Poll {
  id: number;
  title: string;
  description?: string;
  creator_id: number;
  creator_username: string;
  is_active: boolean;
  allow_multiple_votes: boolean;
  created_at: string;
  options: PollOption[];
  total_votes: number;
  total_likes: number;
  user_has_voted: boolean;
  user_has_liked: boolean;
}

export interface CreatePollData {
  title: string;
  description?: string;
  options: string[];
  allow_multiple_votes: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface WebSocketMessage {
  type: 'vote_update' | 'like_update' | 'poll_created';
  data: any;
}
