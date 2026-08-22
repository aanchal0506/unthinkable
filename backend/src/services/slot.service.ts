import * as availabilityRepository from "../repositories/avl.repository";
import * as doctorRepository from "../repositories/doctor.repository";
import * as appointmentRepository from "../repositories/appointment.repository";
import * as leaveRepository from "../repositories/leave.repository";

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

  // 2. Convert requested date
  const appointmentDate = new Date(
    `${date}T00:00:00`
  );

  if (isNaN(appointmentDate.getTime())) {
    throw new Error("Invalid date");
  }

  // 3. Check whether doctor is on leave
  const leave =
    await leaveRepository.getLeaveByDoctorAndDate(
      doctorId,
      appointmentDate
    );

  if (leave) {
    return [];
  }

  // 4. Get day of week
  const dayOfWeek = getDayOfWeek(date);

  // 5. Get doctor's availability
  const availabilities =
    await availabilityRepository.getDoctorAvailability(
      doctorId
    );

  const availability = availabilities.find(
    (item) => item.dayOfWeek === dayOfWeek
  );

  // Doctor doesn't work on this day
  if (!availability) {
    return [];
  }

  // 6. Generate all possible slots
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
      endTime: minutesToTime(
        current + duration
      ),
    });

    current += duration;
  }

  // 7. Get already BOOKED appointments
  const bookedAppointments =
    await appointmentRepository.getBookedAppointments(
      doctorId,
      appointmentDate
    );

  // 8. Remove booked slots
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