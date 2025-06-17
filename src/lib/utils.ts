import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Check if we're running in a browser environment
export const isBrowser = typeof window !== 'undefined';

// Check if Supabase is disabled (for deployment environments)
export const isSupabaseDisabled = () => {
  if (!isBrowser) return true;
  return process.env.NEXT_PUBLIC_DISABLE_SUPABASE === 'true';
};

// Safe localStorage access
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser) return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Error accessing localStorage:', e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (!isBrowser) return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Error setting localStorage:', e);
    }
  }
};