const STORAGE_KEY = "cricfluence_feeds";

export interface FeedSource {
  id: string;
  url: string;
  sourceName: string;
}

function loadFeeds(): FeedSource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FeedSource[];
  } catch {
    return [];
  }
}

function saveFeeds(feeds: FeedSource[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(feeds));
}

// We export a factory-style hook that re-reads from localStorage on every call
// and returns stable mutators. For reactive updates, callers should use the
// returned state and mutators directly.

import { useCallback, useState } from "react";

export function useSavedFeeds() {
  const [feeds, setFeeds] = useState<FeedSource[]>(loadFeeds);

  const addFeed = useCallback((url: string, sourceName: string) => {
    const newFeed: FeedSource = {
      id: crypto.randomUUID(),
      url,
      sourceName,
    };
    setFeeds((prev) => {
      const updated = [...prev, newFeed];
      saveFeeds(updated);
      return updated;
    });
  }, []);

  const removeFeed = useCallback((id: string) => {
    setFeeds((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      saveFeeds(updated);
      return updated;
    });
  }, []);

  return { feeds, addFeed, removeFeed };
}
