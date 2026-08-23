import { Router } from "express";

import * as leaveController from "../controllers/leave.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { createLeaveSchema } from "../validators/schema";

const router = Router();

// Create leave
router.post(
  "/",
  authenticate,
  authorize("DOCTOR"),
  validateBody(createLeaveSchema),
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