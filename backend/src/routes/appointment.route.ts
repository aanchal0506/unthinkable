import { Router } from "express";

import * as appointmentController from "../controllers/appointment.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Book an appointment
router.post(
  "/",
  authenticate,
  appointmentController.bookAppointment
);

// Get logged-in patient's appointments
router.get(
  "/my",
  authenticate,
  appointmentController.getMyAppointments
);

// Cancel an appointment
router.delete(
  "/:id",
  authenticate,
  appointmentController.cancelAppointment
);

export default router;