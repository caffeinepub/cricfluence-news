import { useEffect, useState } from "react";

const STORAGE_KEY = "cricfluence_logo_url";
const DEFAULT_LOGO = "/assets/generated/cricfluence-logo.dim_400x120.png";

// A simple event bus so multiple consumers update together
const listeners = new Set<(url: string) => void>();

function notifyAll(url: string) {
  for (const fn of listeners) fn(url);
}

export function getLogoUrl(): string {
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_LOGO;
}

export function setLogoUrl(url: string): void {
  const trimmed = url.trim();
  if (trimmed) {
    localStorage.setItem(STORAGE_KEY, trimmed);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  notifyAll(trimmed || DEFAULT_LOGO);
}

export function resetLogoUrl(): void {
  localStorage.removeItem(STORAGE_KEY);
  notifyAll(DEFAULT_LOGO);
}

export function useLogoUrl(): string {
  const [logo, setLogo] = useState<string>(getLogoUrl);

  useEffect(() => {
    const handler = (url: string) => setLogo(url);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return logo;
}
