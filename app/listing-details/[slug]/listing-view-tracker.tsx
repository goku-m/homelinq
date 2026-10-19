"use client";

import { useEffect } from "react";

function getSessionId() {
  const storageKey = "homelinq_session_id";
  const existing = window.localStorage.getItem(storageKey);

  if (existing) {
    return existing;
  }

  const next =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(storageKey, next);

  return next;
}

function sendView(payload: {
  durationSeconds?: number;
  id: string;
  listingSlug: string;
  referrer: string;
  sessionId: string;
}) {
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/listing-view", blob);
    return;
  }

  void fetch("/api/analytics/listing-view", {
    body,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    keepalive: true,
    method: "POST",
  });
}

export function ListingViewTracker({ listingSlug }: { listingSlug: string }) {
  useEffect(() => {
    const viewId =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const sessionId = getSessionId();
    const startedAt = Date.now();
    const referrer = document.referrer;

    sendView({
      id: viewId,
      listingSlug,
      referrer,
      sessionId,
    });

    const sendDuration = () => {
      sendView({
        durationSeconds: Math.round((Date.now() - startedAt) / 1000),
        id: viewId,
        listingSlug,
        referrer,
        sessionId,
      });
    };

    window.addEventListener("pagehide", sendDuration);
    document.addEventListener("visibilitychange", sendDuration);

    return () => {
      sendDuration();
      window.removeEventListener("pagehide", sendDuration);
      document.removeEventListener("visibilitychange", sendDuration);
    };
  }, [listingSlug]);

  return null;
}
