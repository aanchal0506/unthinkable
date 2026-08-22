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

// Get logged-in doctor's appointments
router.get(
  "/doctor/my",
  authenticate,
  appointmentController.getMyDoctorAppointments
);

// Complete appointment
router.patch(
  "/:id/complete",
  authenticate,
  appointmentController.completeAppointment
);

// Cancel an appointment
router.delete(
  "/:id",
  authenticate,
  appointmentController.cancelAppointment
);

export default router;