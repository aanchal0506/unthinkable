import cron from "node-cron";

import * as slotHoldRepository from "../repositories/slotHold.repository";

// Expired holds are already ignored by getAvailableSlots/acquireHold, so
// this job is just housekeeping to keep the table small.
const startSlotHoldCleanupJob = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const count = await slotHoldRepository.deleteExpiredHolds();

      if (count > 0) {
        console.log(`[slot-hold-cleanup] Removed ${count} expired hold(s)`);
      }
    } catch (error) {
      console.error("[slot-hold-cleanup] Job failed:", error);
    }
  });

  console.log("Slot hold cleanup job started");
};

export default startSlotHoldCleanupJob;
