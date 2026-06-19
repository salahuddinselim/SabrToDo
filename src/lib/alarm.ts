'use client';

let cachedAudio: AudioContext | null = null;

function getAudio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!cachedAudio) {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    cachedAudio = ctx;
  }
  if (cachedAudio.state === 'suspended') cachedAudio.resume();
  return cachedAudio;
}

export function playAlarm() {
  const ctx = getAudio();
  if (!ctx) return;

  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.setValueAtTime(1100, now + 0.12);
  osc.frequency.setValueAtTime(880, now + 0.24);
  osc.frequency.setValueAtTime(1100, now + 0.36);
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.48);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.48);

  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(1100, now + 0.5);
  osc2.frequency.setValueAtTime(1320, now + 0.62);
  osc2.frequency.setValueAtTime(1100, now + 0.74);
  osc2.frequency.setValueAtTime(1320, now + 0.86);
  gain2.gain.setValueAtTime(0.3, now + 0.5);
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.98);
  osc2.connect(gain2).connect(ctx.destination);
  osc2.start(now + 0.5);
  osc2.stop(now + 0.98);
}

export function playSuccessChime() {
  const ctx = getAudio();
  if (!ctx) return;

  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(660, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.3);
}

const ALARM_KEY = 'todo-alarm-enabled';

export function isAlarmEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(ALARM_KEY) !== 'false';
  } catch {
    return true;
  }
}

export function setAlarmEnabled(enabled: boolean) {
  try {
    localStorage.setItem(ALARM_KEY, String(enabled));
  } catch {}
}
