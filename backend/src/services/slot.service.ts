import * as availabilityRepository from "../repositories/avl.repository";
import * as doctorRepository from "../repositories/doctor.repository";
import * as appointmentRepository from "../repositories/appointment.repository";

const getDayOfWeek = (date: string) => {
  const day = new Date(`${date}T00:00:00`);
  return day.getDay();
};

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(
    mins
  ).padStart(2, "0")}`;
};

const getAvailableSlots = async (
  doctorId: number,
  date: string
) => {
  // 1. Check doctor
  const doctor =
    await doctorRepository.getDoctorById(doctorId);

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  // 2. Get day of week
  const dayOfWeek = getDayOfWeek(date);

  // 3. Get doctor's availability
  const availabilities =
    await availabilityRepository.getDoctorAvailability(
      doctorId
    );

  const availability = availabilities.find(
    (item) => item.dayOfWeek === dayOfWeek
  );

  if (!availability) {
    return [];
  }

  // 4. Generate all possible slots
  const start = timeToMinutes(
    availability.startTime
  );

  const end = timeToMinutes(
    availability.endTime
  );

  const duration = availability.slotDuration;

  const slots = [];

  let current = start;

  while (current + duration <= end) {
    slots.push({
      startTime: minutesToTime(current),
      endTime: minutesToTime(current + duration),
    });

    current += duration;
  }

  // 5. Get already BOOKED appointments
  const appointmentDate = new Date(
    `${date}T00:00:00`
  );

  const bookedAppointments =
    await appointmentRepository.getBookedAppointments(
      doctorId,
      appointmentDate
    );

  // 6. Remove booked slots
  const availableSlots = slots.filter(
    (slot) => {
      return !bookedAppointments.some(
        (appointment) =>
          appointment.startTime ===
          slot.startTime
      );
    }
  );

  return availableSlots;
};

export {
  getAvailableSlots,
};