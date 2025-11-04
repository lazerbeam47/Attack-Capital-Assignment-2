/**
 * Simple scheduler utility
 * Processes scheduled messages every minute when called
 */
import { processScheduledMessages } from "@/lib/messageProcessor";

let isProcessing = false;
let intervalId: NodeJS.Timeout | null = null;

export function startScheduler() {
  if (intervalId) {
    console.log("Scheduler already running");
    return;
  }

  console.log("🚀 Starting message scheduler...");
  
  // Process immediately
  processScheduledMessages();

  // Then process every minute
  intervalId = setInterval(async () => {
    if (isProcessing) {
      console.log("⏭️ Skipping scheduled message processing (already running)");
      return;
    }

    isProcessing = true;
    try {
      const result = await processScheduledMessages();
      if (result.processed > 0) {
        console.log(`📨 Processed ${result.processed} scheduled messages`);
      }
    } catch (error) {
      console.error("❌ Error in scheduled message processing:", error);
    } finally {
      isProcessing = false;
    }
  }, 60000); // Every minute

  console.log("✅ Scheduler started - processing every minute");
}

export function stopScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("🛑 Scheduler stopped");
  }
}

// Auto-start in development
if (process.env.NODE_ENV === "development") {
  // Start after a short delay to ensure everything is initialized
  setTimeout(startScheduler, 5000);
}
