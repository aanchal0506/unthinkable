import { Router } from "express";

import * as slotController from "../controllers/slot.controller";

const router = Router();

router.get(
  "/doctor/:doctorId",
  slotController.getAvailableSlots
);

export default router;