import { Router } from "express";
import symptomController from "../controllers/symptom.controller";
import {authenticate} from "../middleware/auth.middleware";
import {authorize} from "../middleware/role.middleware";

const router = Router();

router.post(
  "/appointments/:appointmentId/symptoms",
  authenticate,
  authorize("PATIENT"),
  symptomController.submitSymptoms
);

router.get(
  "/appointments/:appointmentId/symptoms",
  authenticate,
  authorize("PATIENT"),
  symptomController.getSymptoms
);

export default router;