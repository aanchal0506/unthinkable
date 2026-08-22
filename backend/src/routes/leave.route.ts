import { Router } from "express";

import * as leaveController from "../controllers/leave.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Create leave
router.post(
  "/",
  authenticate,
  leaveController.createLeave
);

// Get my leaves
router.get(
  "/my",
  authenticate,
  leaveController.getMyLeaves
);

// Delete leave
router.delete(
  "/:id",
  authenticate,
  leaveController.deleteLeave
);

export default router;