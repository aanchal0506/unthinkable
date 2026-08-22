import { Router } from "express";
import consultationController from "../controllers/consultation.controller";
import {authenticate} from "../middleware/auth.middleware";
import {authorize} from "../middleware/role.middleware";

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

export default router;