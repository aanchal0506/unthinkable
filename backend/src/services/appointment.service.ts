import * as appointmentRepository from "../repositories/appointment.repository";
import * as doctorRepository from "../repositories/doctor.repository";
import * as userRepository from "../repositories/user.repository";
import * as slotService from "./slot.service";

const bookAppointment = async (
  patientUserId: number,
  doctorId: number,
  dateString: string,
  startTime: string
) => {
  // 1. Check if doctor exists
  const doctor =
    await doctorRepository.getDoctorById(doctorId);

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  // 2. Find patient profile using logged-in user's ID
  const patient =
    await userRepository.getPatientProfileByUserId(
      patientUserId
    );

  if (!patient) {
    throw new Error("Patient profile not found");
  }

  // 3. Validate date
  const date = new Date(
    `${dateString}T00:00:00`
  );

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  // 4. Get available slots for this doctor/date
  const slots =
    await slotService.getAvailableSlots(
      doctorId,
      dateString
    );

  // 5. Check whether requested time is a valid slot
  const slot = slots.find(
    (item) => item.startTime === startTime
  );

  if (!slot) {
    throw new Error(
      "Selected time slot is not available"
    );
  }

  // 6. Create appointment
  // 6. Check if an appointment already exists
const existingAppointment =
  await appointmentRepository.getAppointmentBySlot(
    doctorId,
    date,
    slot.startTime
  );

// Slot is already actively booked
if (
  existingAppointment &&
  existingAppointment.status === "BOOKED"
) {
  throw new Error(
    "This slot has already been booked"
  );
}

// Slot was previously cancelled
if (
  existingAppointment &&
  existingAppointment.status === "CANCELLED"
) {
  return await appointmentRepository.rebookAppointment(
    existingAppointment.id,
    patient.id,
    slot.endTime
  );
}

// 7. Create completely new appointment
return await appointmentRepository.createAppointment({
  patientId: patient.id,
  doctorId,
  date,
  startTime: slot.startTime,
  endTime: slot.endTime,
});
};

const getPatientAppointments = async (
  patientUserId: number
) => {
  // Convert User ID → PatientProfile ID
  const patient =
    await userRepository.getPatientProfileByUserId(
      patientUserId
    );

  if (!patient) {
    throw new Error("Patient profile not found");
  }

  return await appointmentRepository.getPatientAppointments(
    patient.id
  );
};

const getDoctorAppointments = async (
  doctorId: number
) => {
  return await appointmentRepository.getDoctorAppointments(
    doctorId
  );
};

const getDoctorAppointmentsByUserId = async (
  userId: number
) => {
  const doctor =
    await doctorRepository.getDoctorByUserId(userId);

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  return await appointmentRepository.getDoctorAppointments(
    doctor.id
  );
};

const completeAppointment = async (
  appointmentId: number,
  userId: number
) => {
  // Find appointment
  const appointment =
    await appointmentRepository.getAppointmentById(
      appointmentId
    );

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  // Find logged-in doctor's profile
  const doctor =
    await doctorRepository.getDoctorByUserId(userId);

  if (!doctor) {
    throw new Error("Doctor profile not found");
  }

  // Make sure this appointment belongs to this doctor
  if (appointment.doctorId !== doctor.id) {
    throw new Error(
      "You can only complete your own appointments"
    );
  }

  // Only BOOKED appointments can be completed
  if (appointment.status !== "BOOKED") {
    throw new Error(
      "Only booked appointments can be completed"
    );
  }

  return await appointmentRepository.completeAppointment(
    appointmentId
  );
};

const cancelAppointment = async (
  appointmentId: number,
  userId: number,
  role: "PATIENT" | "DOCTOR" | "ADMIN"
) => {
  // 1. Find appointment
  const appointment =
    await appointmentRepository.getAppointmentById(
      appointmentId
    );

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  // 2. Check if already cancelled
  if (appointment.status === "CANCELLED") {
    throw new Error(
      "Appointment already cancelled"
    );
  }

  // 3. Patient can cancel only their own appointment
  if (role === "PATIENT") {
    const patient =
      await userRepository.getPatientProfileByUserId(
        userId
      );

    if (
      !patient ||
      appointment.patientId !== patient.id
    ) {
      throw new Error(
        "You can only cancel your own appointments"
      );
    }
  }

  // 4. Doctor can cancel only their own appointment
  if (role === "DOCTOR") {
    const doctor =
      await doctorRepository.getDoctorByUserId(
        userId
      );

    if (
      !doctor ||
      appointment.doctorId !== doctor.id
    ) {
      throw new Error(
        "You can only cancel your own appointments"
      );
    }
  }

  // 5. Admin can cancel any appointment

  return await appointmentRepository.cancelAppointment(
    appointmentId
  );
};

const getDoctorAppointmentDetails = async (
  appointmentId: number,
  doctorUserId: number
) => {
  const appointment =
    await appointmentRepository.getDoctorAppointmentDetails(
      appointmentId
    );

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  // appointment.doctorId is DoctorProfile.id
  // doctorUserId is User.id from JWT

  if (appointment.doctor.userId !== doctorUserId) {
    throw new Error(
      "You are not authorized to view this appointment"
    );
  }

  return appointment;
};

const getPatientAppointmentsService = async (
  patientUserId: number
) => {
  const patient = await userRepository.getPatientProfileByUserId(patientUserId);

  if (!patient) {
    throw new Error("Patient profile not found");
  }

  return await getPatientAppointments(patient.id);
};

const getPatientAppointmentDetailsService = async (
  appointmentId: number,
  patientUserId: number
) => {
  const patient = await userRepository.getPatientProfileByUserId(patientUserId);

  if (!patient) {
    throw new Error("Patient profile not found");
  }

  const appointment = await appointmentRepository.getPatientAppointmentDetails(
    appointmentId,
    patient.id
  );

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  return appointment;
};

export {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  cancelAppointment,
  getDoctorAppointmentsByUserId,
  completeAppointment,
  getDoctorAppointmentDetails,
  getPatientAppointmentsService,
  getPatientAppointmentDetailsService,
};