export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  notify_before: number;
  created_at: string;
  completed_at?: string;
  order_index: number;
}

export interface User {
  id: string;
  firebase_uid: string;
  email: string;
  display_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'due_soon' | 'overdue' | 'completed' | 'daily_summary';
  title: string;
  message?: string;
  task_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  notify_before: number;
}

export interface UserSettings {
  daily_goal: number;
  selected_theme: string;
  notif_states: Record<string, boolean>;
  sec_states: Record<string, boolean>;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  csrfToken?: string;
}
