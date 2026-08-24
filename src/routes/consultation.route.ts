import { Router } from "express";
import consultationController from "../controllers/consultation.controller";
import {authenticate} from "../middleware/auth.middleware";
import {authorize} from "../middleware/role.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { createConsultationSchema } from "../validators/schema";

const router = Router();

router.post(
  "/appointments/:appointmentId/consultation",
  authenticate,
  authorize("DOCTOR"),
  consultationController.createConsultation
);

router.get(
  "/appointments/:appointmentId/consultation",
  authenticate,
  authorize("DOCTOR"),
  consultationController.getConsultation
);

router.post(
  "/appointments/:appointmentId/consultation/regenerate-summary",
  authenticate,
  authorize("DOCTOR"),
  consultationController.regeneratePatientSummary
);

export default router;
