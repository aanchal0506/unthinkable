import { Router } from "express";
import symptomController from "../controllers/symptom.controller";
import {authenticate} from "../middleware/auth.middleware";
import {authorize} from "../middleware/role.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { submitSymptomsSchema } from "../validators/schema";

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

// Doctor or patient can manually retry AI pre-visit summary generation if it
// previously failed (LLM timeout/outage).
router.post(
  "/appointments/:appointmentId/symptoms/regenerate-summary",
  authenticate,
  authorize("PATIENT", "DOCTOR"),
  symptomController.regenerateSummary
);

export default router;
