import { Router } from "express";

import * as appointmentController from "../controllers/appointment.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { bookAppointmentSchema } from "../validators/schema";

const router = Router();

// Book an appointment
router.post(
  "/",
  authenticate,
  validateBody(bookAppointmentSchema),
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

router.get(
  "/doctor/appointments/:appointmentId",
  authenticate,
  authorize("DOCTOR"),
  appointmentController.getDoctorAppointmentDetails
);

router.get(
  "/patient/appointments",
  authenticate,
  authorize("PATIENT"),
  appointmentController.getPatientAppointments
);

router.get(
  "/patient/appointments/:appointmentId",
  authenticate,
  authorize("PATIENT"),
  appointmentController.getPatientAppointmentDetails
);

export default router;