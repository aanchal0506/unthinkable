import { Router } from "express";

import * as availabilityController from "../controllers/avl.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

// Get doctor's availability
router.get(
  "/doctor/:doctorId",
  availabilityController.getDoctorAvailability
);

// Admin creates availability
router.post(
  "/doctor/:doctorId",
  authenticate,
  authorize("ADMIN"),
  availabilityController.createAvailability
);

// Admin updates availability
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  availabilityController.updateAvailability
);

// Admin deletes availability
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  availabilityController.deleteAvailability
);

export default router;