import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function isToday(date: string | Date): boolean {
  const d = new Date(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

export function isUpcoming(date: string | Date): boolean {
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d > today;
}

export function isOverdue(date: string | Date): boolean {
  const d = new Date(date);
  const now = new Date();
  return d < now;
}

export function getDueDateStatus(date: string | Date): 'overdue' | 'today' | 'upcoming' {
  const d = new Date(date);
  const now = new Date();
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  if (d < now) return 'overdue';
  if (d <= endOfToday) return 'today';
  return 'upcoming';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

const EVENT_HANDLERS = [
  'onclick', 'ondblclick', 'onmousedown', 'onmouseup', 'onmouseover',
  'onmousemove', 'onmouseout', 'onmouseenter', 'onmouseleave',
  'onfocus', 'onblur', 'onchange', 'oninput', 'onselect', 'onsubmit',
  'onkeydown', 'onkeypress', 'onkeyup', 'onload', 'onerror',
  'onabort', 'onbeforeunload', 'onhashchange', 'onpopstate',
  'onresize', 'onscroll', 'onstorage', 'ontoggle', 'onunload',
  'onpointerdown', 'onpointerup', 'onpointermove', 'onpointerover',
  'onpointerout', 'onpointerenter', 'onpointerleave',
  'ondrag', 'ondragend', 'ondragenter', 'ondragleave', 'ondragover',
  'ondragstart', 'ondrop', 'onwheel',
  'ontouchstart', 'ontouchend', 'ontouchmove', 'ontouchcancel',
  'onanimationstart', 'onanimationend', 'onanimationiteration',
  'ontransitionstart', 'ontransitionend', 'ontransitionrun', 'ontransitioncancel',
];

const EVENT_HANDLER_PATTERN = new RegExp(
  `(?:${EVENT_HANDLERS.map((h) => h.replace('on', '')).join('|')})\\s*=`,
  'i'
);

const INJECTION_PATTERNS = [
  /<script[\s>]/i,
  /javascript\s*:/i,
  EVENT_HANDLER_PATTERN,
  /data\s*:\s*text\s*\/\s*html/i,
  /<embed[\s>]/i,
  /<object[\s>]/i,
  /<iframe[\s>]/i,
  /<frame[\s>]/i,
  /<form[\s>]/i,
  /<svg[\s>]/i,
  /<math[\s>]/i,
  /<style[\s>]/i,
  /<link[\s>]/i,
  /<base[\s>]/i,
  /vbscript\s*:/i,
  /&#/i,
  /\\u003c/i,
  /\\x3c/i,
  /\0/i,
];

export function containsInjectionPatterns(value: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(value));
}

export function sanitize(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
