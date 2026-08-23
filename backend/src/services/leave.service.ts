import * as leaveRepository from "../repositories/leave.repository";
import * as doctorRepository from "../repositories/doctor.repository";
import * as appointmentRepository from "../repositories/appointment.repository";
import * as notificationService from "./notification.service";
import * as appointmentCalendarService from "./appointmentCalendar.service";
import { buildLeaveConflictEmail } from "./email.service";

const createLeave = async (
  userId: number,
  dateString: string,
  reason?: string
) => {
  // Find doctor using logged-in user's ID
  const doctor =
    await doctorRepository.getDoctorByUserId(userId);

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  // Validate date
  const date = new Date(
    `${dateString}T00:00:00`
  );

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  // Check if leave already exists
  const existingLeave =
    await leaveRepository.getLeaveByDoctorAndDate(
      doctor.id,
      date
    );

  if (existingLeave) {
    throw new Error(
      "Leave already exists for this date"
    );
  }

  const leave = await leaveRepository.createLeave({
    doctorId: doctor.id,
    date,
    reason,
  });

  // Find any patients already booked on this date and cancel + notify them.
  // Each patient is handled independently so one failed email/calendar call
  // never stops the others (or the leave itself) from going through.
  const affectedAppointments =
    await appointmentRepository.getBookedAppointmentsByDoctorAndDate(
      doctor.id,
      date
    );

  let notifiedCount = 0;

  for (const appointment of affectedAppointments) {
    try {
      const cancelled = await appointmentRepository.cancelAppointmentWithMeta(
        appointment.id,
        "DOCTOR",
        reason ? `Doctor on leave: ${reason}` : "Doctor marked unavailable for this date"
      );

      const { subject, html } = buildLeaveConflictEmail(
        appointment.patient.user.name,
        doctor.user.name,
        appointment.date,
        appointment.startTime,
        appointment.endTime
      );

      await notificationService.dispatch(
        "LEAVE_CONFLICT",
        appointment.patient.user.email,
        subject,
        html,
        appointment.id
      );

      await appointmentCalendarService.syncDelete({
        id: appointment.id,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        googlePatientEventId: cancelled.googlePatientEventId,
        googleDoctorEventId: cancelled.googleDoctorEventId,
        patient: { user: appointment.patient.user as any },
        doctor: { user: doctor.user as any },
      });

      notifiedCount += 1;
    } catch (error) {
      console.error(
        `[leave] Failed to cancel/notify for appointment ${appointment.id}:`,
        error
      );
    }
  }

  return { leave, affectedAppointments: notifiedCount };
};

const getMyLeaves = async (userId: number) => {
  const doctor =
    await doctorRepository.getDoctorByUserId(userId);

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  return await leaveRepository.getDoctorLeaves(
    doctor.id
  );
};

const deleteLeave = async (
  userId: number,
  leaveId: number
) => {
  const doctor =
    await doctorRepository.getDoctorByUserId(userId);

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  const leave =
    await leaveRepository.getLeaveById(leaveId);

  if (!leave) {
    throw new Error("Leave not found");
  }

  // Make sure doctor owns this leave
  if (leave.doctorId !== doctor.id) {
    throw new Error(
      "You can only delete your own leaves"
    );
  }

  return await leaveRepository.deleteLeave(
    leaveId
  );
};

export {
  createLeave,
  getMyLeaves,
  deleteLeave,
};
