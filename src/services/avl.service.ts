import * as availabilityRepository from "../repositories/avl.repository";
import * as doctorRepository from "../repositories/doctor.repository";

const createAvailability = async (
  doctorId: number,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  slotDuration: number
) => {
  const doctor = await doctorRepository.getDoctorById(doctorId);

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  if (dayOfWeek < 0 || dayOfWeek > 6) {
    throw new Error(
      "dayOfWeek must be between 0 and 6"
    );
  }

  if (startTime >= endTime) {
    throw new Error(
      "Start time must be before end time"
    );
  }

  if (slotDuration <= 0) {
    throw new Error(
      "Slot duration must be greater than 0"
    );
  }

  const availability =
    await availabilityRepository.createAvailability(
      doctorId,
      dayOfWeek,
      startTime,
      endTime,
      slotDuration
    );

  return availability;
};

const getDoctorAvailability = async (
  doctorId: number
) => {
  const doctor = await doctorRepository.getDoctorById(
    doctorId
  );

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  return await availabilityRepository.getDoctorAvailability(
    doctorId
  );
};

const updateAvailability = async (
  id: number,
  data: {
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
    slotDuration?: number;
  }
) => {
  const availability =
    await availabilityRepository.getAvailabilityById(id);

  if (!availability) {
    throw new Error("Availability not found");
  }

  if (
    data.dayOfWeek !== undefined &&
    (data.dayOfWeek < 0 || data.dayOfWeek > 6)
  ) {
    throw new Error(
      "dayOfWeek must be between 0 and 6"
    );
  }

  if (
    data.startTime &&
    data.endTime &&
    data.startTime >= data.endTime
  ) {
    throw new Error(
      "Start time must be before end time"
    );
  }

  if (
    data.slotDuration !== undefined &&
    data.slotDuration <= 0
  ) {
    throw new Error(
      "Slot duration must be greater than 0"
    );
  }

  return await availabilityRepository.updateAvailability(
    id,
    data
  );
};

const deleteAvailability = async (id: number) => {
  const availability =
    await availabilityRepository.getAvailabilityById(id);

  if (!availability) {
    throw new Error("Availability not found");
  }

  await availabilityRepository.deleteAvailability(id);

  return {
    message: "Availability deleted successfully",
  };
};

export {
  createAvailability,
  getDoctorAvailability,
  updateAvailability,
  deleteAvailability,
};