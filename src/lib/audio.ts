"use client";

import { useEffect, useState } from "react";

// Durations are not in the API, so each book's MP3 metadata is read once and cached per URL.
const cache = new Map<string, number>();
const pending = new Map<string, Promise<number>>();

function loadDuration(url: string): Promise<number> {
  if (cache.has(url)) return Promise.resolve(cache.get(url)!);
  if (!pending.has(url)) {
    pending.set(
      url,
      new Promise<number>((resolve) => {
        const audio = new Audio();
        audio.preload = "metadata";
        audio.onloadedmetadata = () => {
          const seconds = Number.isFinite(audio.duration) ? audio.duration : 0;
          cache.set(url, seconds);
          resolve(seconds);
        };
        audio.onerror = () => resolve(0);
        audio.src = url;
      }),
    );
  }
  return pending.get(url)!;
}

export function useAudioDuration(url?: string): number | null {
  const [seconds, setSeconds] = useState<number | null>(() => (url && cache.has(url) ? cache.get(url)! : null));
  useEffect(() => {
    if (!url) return;
    let active = true;
    loadDuration(url).then((value) => active && setSeconds(value));
    return () => {
      active = false;
    };
  }, [url]);
  return seconds;
}

export function formatTime(total: number | null | undefined): string {
  const value = Math.max(0, Math.floor(total ?? 0));
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatLong(total: number | null | undefined): string {
  const value = Math.max(0, Math.floor(total ?? 0));
  return `${Math.floor(value / 60)} mins ${value % 60} secs`;
}
