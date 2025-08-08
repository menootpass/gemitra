"use client";
import { useEffect } from "react";

export default function VisitorTracker() {
  useEffect(() => {
    localStorage.removeItem("adminUser");
    fetch("/api/track-visitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "track_visitor" }),
    });
  }, []);
  return null;
}