import { Router } from "express";

import * as slotController from "../controllers/slot.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { holdSlotSchema } from "../validators/schema";

const router = Router();

router.get(
  "/doctor/:doctorId",
  slotController.getAvailableSlots
);

// Place / release a short-lived hold on a slot while the patient completes
// the booking flow (symptom form, review, confirm).
router.post("/hold", authenticate, validateBody(holdSlotSchema), slotController.holdSlot);
router.post("/release", authenticate, validateBody(holdSlotSchema), slotController.releaseSlotHold);

export default router;
