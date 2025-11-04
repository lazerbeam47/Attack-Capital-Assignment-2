/**
 * Scheduler Initializer
 * Starts the message scheduler in development
 */
"use client";

import { useEffect } from "react";

export function SchedulerInit() {
  useEffect(() => {
    // Only auto-start in development
    if (process.env.NODE_ENV === "development") {
      // Import and start scheduler after component mounts
      import("@/lib/scheduler").then(({ startScheduler }) => {
        setTimeout(startScheduler, 2000);
      });
    }
  }, []);

  // This component renders nothing
  return null;
}
