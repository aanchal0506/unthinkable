import prisma from "../config/prisma";

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

export {
  createAppointment,
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
};