// Server-side scheduler initialization
// This runs once when the server starts

import { startScheduler } from './scheduler';

// Initialize the scheduler when this module is imported
if (typeof window === 'undefined') {
  // Only run on server side
  setTimeout(() => {
    try {
      startScheduler();
      console.log('✅ Message scheduler started successfully');
    } catch (error) {
      console.error('❌ Failed to start message scheduler:', error);
    }
  }, 1000); // Small delay to ensure everything is initialized
}

export {}; // Make this a module
