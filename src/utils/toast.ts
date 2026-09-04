import { Tone } from '../data';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  tone?: Tone;
}

export const TOAST_EVENT = 'cia-toast-notify';

export function notifyManager(title: string, message?: string, tone: Tone = 'ok') {
  if (typeof window === 'undefined') return;
  const event = new CustomEvent(TOAST_EVENT, {
    detail: {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      message,
      tone,
    },
  });
  window.dispatchEvent(event);
}
