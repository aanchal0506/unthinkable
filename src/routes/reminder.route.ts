import { Router } from "express";
import * as reminderController from "../controllers/reminder.controller";
import {authenticate} from "../middleware/auth.middleware";
import {authorize} from "../middleware/role.middleware";

const router = Router();

router.get(
  "/prescription/:prescriptionId",
  authenticate,
  authorize("PATIENT"),
  reminderController.getPrescriptionReminders
);

export default router;