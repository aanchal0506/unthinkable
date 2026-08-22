import { Request, Response } from "express";

import * as appointmentService from "../services/appointment.service";

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: "PATIENT" | "DOCTOR" | "ADMIN";
  };
}

// Book appointment
const bookAppointment = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (req.user.role !== "PATIENT") {
      return res.status(403).json({
        message: "Only patients can book appointments",
      });
    }

    const { doctorId, date, startTime } = req.body;

    if (!doctorId || !date || !startTime) {
      return res.status(400).json({
        message:
          "doctorId, date and startTime are required",
      });
    }

    const appointment =
      await appointmentService.bookAppointment(
        req.user.id,
        Number(doctorId),
        date,
        startTime
      );

    return res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error: any) {
    console.error("Book appointment error:", error);

    if (error.message === "Doctor not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (
      error.message === "Patient profile not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error.message === "Invalid date") {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (
      error.message ===
      "Selected time slot is not available"
    ) {
      return res.status(409).json({
        message: error.message,
      });
    }

    if (
      error.message ===
      "This slot has already been booked"
    ) {
      return res.status(409).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to book appointment",
    });
  }
};

// Get logged-in patient's appointments
const getMyAppointments = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (req.user.role !== "PATIENT") {
      return res.status(403).json({
        message: "Only patients can access this",
      });
    }

    const appointments =
      await appointmentService.getPatientAppointments(
        req.user.id
      );

    return res.status(200).json({
      appointments,
    });
  } catch (error: any) {
    console.error(
      "Get appointments error:",
      error
    );

    if (
      error.message === "Patient profile not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to fetch appointments",
    });
  }
};

// Get logged-in doctor's appointments
const getMyDoctorAppointments = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (req.user.role !== "DOCTOR") {
      return res.status(403).json({
        message: "Only doctors can access this",
      });
    }

    const appointments =
      await appointmentService.getDoctorAppointmentsByUserId(
        req.user.id
      );

    return res.status(200).json({
      appointments,
    });
  } catch (error: any) {
    console.error(
      "Get doctor appointments error:",
      error
    );

    if (
      error.message ===
      "Doctor profile not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to fetch appointments",
    });
  }
};

// Complete appointment
const completeAppointment = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (req.user.role !== "DOCTOR") {
      return res.status(403).json({
        message:
          "Only doctors can complete appointments",
      });
    }

    const appointmentId = Number(
      req.params.id
    );

    if (isNaN(appointmentId)) {
      return res.status(400).json({
        message: "Invalid appointment ID",
      });
    }

    const appointment =
      await appointmentService.completeAppointment(
        appointmentId,
        req.user.id
      );

    return res.status(200).json({
      message:
        "Appointment completed successfully",
      appointment,
    });
  } catch (error: any) {
    console.error(
      "Complete appointment error:",
      error
    );

    if (
      error.message === "Appointment not found" ||
      error.message ===
        "Doctor profile not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (
      error.message ===
        "You can only complete your own appointments" ||
      error.message ===
        "Only booked appointments can be completed"
    ) {
      return res.status(403).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to complete appointment",
    });
  }
};

// Cancel appointment
const cancelAppointment = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const appointmentId = Number(req.params.id);

    if (isNaN(appointmentId)) {
      return res.status(400).json({
        message: "Invalid appointment ID",
      });
    }

    const appointment =
      await appointmentService.cancelAppointment(
        appointmentId,
        req.user.id,
        req.user.role
      );

    return res.status(200).json({
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error: any) {
    console.error(
      "Cancel appointment error:",
      error
    );

    if (
      error.message === "Appointment not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (
      error.message ===
      "Appointment already cancelled"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (
      error.message.includes(
        "only cancel your own appointments"
      )
    ) {
      return res.status(403).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to cancel appointment",
    });
  }
};

const getDoctorAppointmentDetails = async (
  req: Request,
  res: Response
) => {
  try {
    const appointmentId = Number(req.params.appointmentId);

    const doctorUserId = Number((req as any).user.id);

    if (!appointmentId || Number.isNaN(appointmentId)) {
      return res.status(400).json({
        message: "Invalid appointment ID",
      });
    }

    const appointment =
      await appointmentService.getDoctorAppointmentDetails(
        appointmentId,
        doctorUserId
      );

    return res.status(200).json({
      appointment,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const getPatientAppointments = async (
  req: Request,
  res: Response
) => {
  try {
    const patientUserId = Number((req as any).user.id);

    const appointments =
      await appointmentService.getPatientAppointmentsService(
        patientUserId
      );

    return res.status(200).json({
      appointments,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const getPatientAppointmentDetails = async (
  req: Request,
  res: Response
) => {
  try {
    const appointmentId = Number(req.params.appointmentId);

    const patientUserId = Number((req as any).user.id);

    if (!appointmentId || Number.isNaN(appointmentId)) {
      return res.status(400).json({
        message: "Invalid appointment ID",
      });
    }

    const appointment =
      await appointmentService.getPatientAppointmentDetailsService(
        appointmentId,
        patientUserId
      );

    return res.status(200).json({
      appointment,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: error.message,
    });
  }
};

export {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getMyDoctorAppointments,
  completeAppointment,
  getDoctorAppointmentDetails,
  getPatientAppointments,
  getPatientAppointmentDetails,
};