import { Task, User, Notification, TaskFormData, UserSettings } from '@/types';

const BASE = '/api';

async function request<T>(
  url: string,
  options?: RequestInit & { csrfToken?: string }
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (options?.csrfToken) {
    headers['X-CSRF-Token'] = options.csrfToken;
  }
  const { csrfToken: _csrf, ...fetchOptions } = options || {};
  const res = await fetch(url, {
    headers,
    cache: 'no-store',
    ...fetchOptions,
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
  displayName?: string,
  csrfToken?: string
): Promise<User> => {
  return request(`${BASE}/users`, {
    method: 'POST',
    body: JSON.stringify({ firebaseUid, email, displayName }),
    csrfToken,
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
  task: Omit<Task, 'id' | 'created_at' | 'order_index'>,
  csrfToken?: string
): Promise<Task> => {
  return request(`${BASE}/tasks`, {
    method: 'POST',
    body: JSON.stringify(task),
    csrfToken,
  });
};

export const updateTask = async (
  id: string,
  updates: Partial<Task>,
  csrfToken?: string
): Promise<Task> => {
  return request(`${BASE}/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
    csrfToken,
  });
};

export const deleteTask = async (id: string, csrfToken?: string): Promise<void> => {
  await request(`${BASE}/tasks/${id}`, { method: 'DELETE', csrfToken });
};

export const reorderTasks = async (
  userId: string,
  taskIds: string[],
  csrfToken?: string
): Promise<void> => {
  await request(`${BASE}/tasks/reorder`, {
    method: 'POST',
    body: JSON.stringify({ userId, taskIds }),
    csrfToken,
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
  notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>,
  csrfToken?: string
): Promise<Notification> => {
  return request(`${BASE}/notifications`, {
    method: 'POST',
    body: JSON.stringify(notification),
    csrfToken,
  });
};

export const markNotificationAsRead = async (id: string, csrfToken?: string): Promise<void> => {
  await request(`${BASE}/notifications/${id}`, { method: 'PATCH', csrfToken });
};

export const markAllNotificationsAsRead = async (
  userId: string,
  csrfToken?: string
): Promise<void> => {
  await request(`${BASE}/notifications/mark-all-read`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
    csrfToken,
  });
};

export const getSettings = async (csrfToken?: string): Promise<UserSettings> => {
  return request(`${BASE}/settings`, { csrfToken });
};

export const updateSettings = async (
  settings: Partial<UserSettings>,
  csrfToken?: string
): Promise<UserSettings> => {
  return request(`${BASE}/settings`, {
    method: 'PATCH',
    body: JSON.stringify(settings),
    csrfToken,
  });
};
