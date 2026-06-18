import { Task, User, Notification, TaskFormData } from '@/types';

const BASE = '/api';

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const createOrUpdateUser = async (
  firebaseUid: string,
  email: string,
  displayName?: string
): Promise<User> => {
  return request(`${BASE}/users`, {
    method: 'POST',
    body: JSON.stringify({ firebaseUid, email, displayName }),
  });
};

export const getUserByFirebaseUid = async (
  firebaseUid: string
): Promise<User | null> => {
  try {
    return await request(`${BASE}/users/${encodeURIComponent(firebaseUid)}`);
  } catch {
    return null;
  }
};

export const getTasks = async (userId: string): Promise<Task[]> => {
  return request(`${BASE}/tasks?userId=${encodeURIComponent(userId)}`);
};

export const createTask = async (
  task: Omit<Task, 'id' | 'created_at' | 'order_index'>
): Promise<Task> => {
  return request(`${BASE}/tasks`, {
    method: 'POST',
    body: JSON.stringify(task),
  });
};

export const updateTask = async (
  id: string,
  updates: Partial<Task>
): Promise<Task> => {
  return request(`${BASE}/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};

export const deleteTask = async (id: string): Promise<void> => {
  await request(`${BASE}/tasks/${id}`, { method: 'DELETE' });
};

export const reorderTasks = async (
  userId: string,
  taskIds: string[]
): Promise<void> => {
  await request(`${BASE}/tasks/reorder`, {
    method: 'POST',
    body: JSON.stringify({ userId, taskIds }),
  });
};

export const getNotifications = async (
  userId: string
): Promise<Notification[]> => {
  return request(
    `${BASE}/notifications?userId=${encodeURIComponent(userId)}`
  );
};

export const createNotification = async (
  notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>
): Promise<Notification> => {
  return request(`${BASE}/notifications`, {
    method: 'POST',
    body: JSON.stringify(notification),
  });
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  await request(`${BASE}/notifications/${id}`, { method: 'PATCH' });
};

export const markAllNotificationsAsRead = async (
  userId: string
): Promise<void> => {
  await request(`${BASE}/notifications/mark-all-read`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
};
