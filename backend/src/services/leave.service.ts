import * as leaveRepository from "../repositories/leave.repository";
import * as doctorRepository from "../repositories/doctor.repository";

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

  return await leaveRepository.createLeave({
    doctorId: doctor.id,
    date,
    reason,
  });
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