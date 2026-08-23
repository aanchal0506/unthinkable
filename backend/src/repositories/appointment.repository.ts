import prisma from "../config/prisma";
import { Prisma } from "../generated/prisma/client";

const createAppointment = async (data: {
  patientId: number;
  doctorId: number;
  date: Date;
  startTime: string;
  endTime: string;
}) => {
  return await prisma.appointment.create({
    data,
  });
};

// Atomically creates the appointment (or rebooks a cancelled one) and
// releases the corresponding slot hold in a single transaction, catching the
// database's own unique-constraint violation (doctorId+date+startTime) as
// the final, race-proof line of defense against double-booking — the earlier
// availability check and the slot hold are both just best-effort UX layers
// on top of this.
const bookSlotTransactionally = async (params: {
  doctorId: number;
  date: Date;
  startTime: string;
  endTime: string;
  patientId: number;
  existingCancelledAppointmentId?: number;
}) => {
  try {
    return await prisma.$transaction(async (tx) => {
      let appointment;

      if (params.existingCancelledAppointmentId) {
        appointment = await tx.appointment.update({
          where: { id: params.existingCancelledAppointmentId },
          data: {
            patientId: params.patientId,
            endTime: params.endTime,
            status: "BOOKED",
            cancelledBy: null,
            cancelReason: null,
            googlePatientEventId: null,
            googleDoctorEventId: null,
            reminderSentAt: null,
          },
        });
      } else {
        appointment = await tx.appointment.create({
          data: {
            patientId: params.patientId,
            doctorId: params.doctorId,
            date: params.date,
            startTime: params.startTime,
            endTime: params.endTime,
          },
        });
      }

      await tx.slotHold.deleteMany({
        where: {
          doctorId: params.doctorId,
          date: params.date,
          startTime: params.startTime,
        },
      });

      return appointment;
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("This slot has already been booked");
    }

    throw error;
  }
};

const getAppointmentById = async (id: number) => {
  return await prisma.appointment.findUnique({
    where: {
      id,
    },
  });
};

const getDoctorAppointmentDetails = async (appointmentId: number) => {
  return await prisma.appointment.findUnique({
    where: {
      id: appointmentId,
    },
    include: {
      patient: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },

      doctor: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },

      symptomSubmission: true,

      consultation: {
        include: {
          prescriptions: true,
        },
      },
    },
  });
};

const getPatientAppointments = async (
  patientId: number
) => {
  return await prisma.appointment.findMany({
    where: {
      patientId,
    },
    include: {
      doctor: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });
};

const getPatientAppointmentDetails = async (
  appointmentId: number,
  patientId: number
) => {
  return await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      patientId,
    },
    include: {
      doctor: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },

      symptomSubmission: true,

      consultation: {
        include: {
          prescriptions: true,
        },
      },
    },
  });
};

const getDoctorAppointments = async (
  doctorId: number
) => {
  return await prisma.appointment.findMany({
    where: {
      doctorId,
    },
    include: {
      patient: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });
};

const getBookedAppointments = async (
  doctorId: number,
  date: Date
) => {
  return await prisma.appointment.findMany({
    where: {
      doctorId,
      date,
      status: "BOOKED",
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });
};

const cancelAppointment = async (id: number) => {
  return await prisma.appointment.update({
    where: {
      id,
    },
    data: {
      status: "CANCELLED",
    },
  });
};

const getAppointmentBySlot = async (
  doctorId: number,
  date: Date,
  startTime: string
) => {
  return await prisma.appointment.findUnique({
    where: {
      doctorId_date_startTime: {
        doctorId,
        date,
        startTime,
      },
    },
  });
};

const rebookAppointment = async (
  id: number,
  patientId: number,
  endTime: string
) => {
  return await prisma.appointment.update({
    where: {
      id,
    },
    data: {
      patientId,
      endTime,
      status: "BOOKED",
    },
  });
};

const completeAppointment = async (id: number) => {
  return await prisma.appointment.update({
    where: {
      id,
    },
    data: {
      status: "COMPLETED",
    },
  });
};

const getAppointmentNotificationDetails = async (
  appointmentId: number
) => {
  return await prisma.appointment.findUnique({
    where: {
      id: appointmentId,
    },
    include: {
      patient: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },

      doctor: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
};

const getBookedAppointmentsByDoctorAndDate = async (
  doctorId: number,
  date: Date
) => {
  return await prisma.appointment.findMany({
    where: {
      doctorId,
      date,
      status: "BOOKED",
    },
    include: {
      patient: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
};

// Appointments happening within [from, to) that haven't had a reminder
// email sent yet. Used by the appointment reminder cron job.
const getAppointmentsNeedingReminder = async (from: Date, to: Date) => {
  return await prisma.appointment.findMany({
    where: {
      status: "BOOKED",
      date: { gte: from, lt: to },
      reminderSentAt: null,
    },
    include: {
      patient: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
      doctor: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  });
};

const markReminderSent = async (id: number) => {
  return await prisma.appointment.update({
    where: { id },
    data: { reminderSentAt: new Date() },
  });
};

const updateGoogleEventIds = async (
  id: number,
  data: { googlePatientEventId?: string | null; googleDoctorEventId?: string | null }
) => {
  return await prisma.appointment.update({
    where: { id },
    data,
  });
};

const cancelAppointmentWithMeta = async (
  id: number,
  cancelledBy: "PATIENT" | "DOCTOR" | "ADMIN",
  cancelReason?: string
) => {
  return await prisma.appointment.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancelledBy,
      cancelReason,
    },
  });
};

export {
  createAppointment,
  bookSlotTransactionally,
  getAppointmentById,
  getPatientAppointments,
  getDoctorAppointments,
  getBookedAppointments,
  getAppointmentBySlot,
  rebookAppointment,
  cancelAppointment,
  completeAppointment,
  getDoctorAppointmentDetails,
  getPatientAppointmentDetails,
  getAppointmentNotificationDetails,
  getBookedAppointmentsByDoctorAndDate,
  getAppointmentsNeedingReminder,
  markReminderSent,
  updateGoogleEventIds,
  cancelAppointmentWithMeta,
};