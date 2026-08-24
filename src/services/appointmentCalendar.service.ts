import * as googleCalendarService from "./googleCalendar.service";
import * as appointmentRepository from "../repositories/appointment.repository";

interface AppointmentForCalendar {
  id: number;
  date: Date;
  startTime: string;
  endTime: string;
  googlePatientEventId?: string | null;
  googleDoctorEventId?: string | null;
  patient: { user: { id: number; name: string } };
  doctor: { user: { id: number; name: string } };
}

// Creates a calendar event on each side that has linked Google Calendar.
// Either, both, or neither may succeed — this never throws, so a booking
// always succeeds even if Google Calendar is unreachable.
const syncCreate = async (appointment: AppointmentForCalendar): Promise<void> => {
  const [patientEventId, doctorEventId] = await Promise.all([
    googleCalendarService.createEvent(appointment.patient.user.id, {
      summary: `Appointment with Dr. ${appointment.doctor.user.name}`,
      description: "Healthcare Appointment Manager booking",
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
    }),
    googleCalendarService.createEvent(appointment.doctor.user.id, {
      summary: `Appointment with ${appointment.patient.user.name}`,
      description: "Healthcare Appointment Manager booking",
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
    }),
  ]);

  if (patientEventId || doctorEventId) {
    await appointmentRepository.updateGoogleEventIds(appointment.id, {
      googlePatientEventId: patientEventId,
      googleDoctorEventId: doctorEventId,
    });
  }
};

const syncDelete = async (appointment: AppointmentForCalendar): Promise<void> => {
  await Promise.all([
    appointment.googlePatientEventId
      ? googleCalendarService.deleteEvent(appointment.patient.user.id, appointment.googlePatientEventId)
      : Promise.resolve(),
    appointment.googleDoctorEventId
      ? googleCalendarService.deleteEvent(appointment.doctor.user.id, appointment.googleDoctorEventId)
      : Promise.resolve(),
  ]);
};

export { syncCreate, syncDelete };
