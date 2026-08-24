import cron from "node-cron";

import * as notificationService from "../services/notification.service";

// Retries failed email sends (booking confirmations, cancellations, leave
// conflict notices, appointment reminders...) every 5 minutes, up to 5
// attempts per notification (see notification.service.ts). This is what
// makes "notification failure handling" durable instead of best-effort.
const startNotificationRetryJob = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const { retried, sent } = await notificationService.retryFailed();

      if (retried > 0) {
        console.log(
          `[notification-retry] Retried ${retried} failed notification(s), ${sent} succeeded`
        );
      }
    } catch (error) {
      console.error("[notification-retry] Job failed:", error);
    }
  });

  console.log("Notification retry job started");
};

export default startNotificationRetryJob;
