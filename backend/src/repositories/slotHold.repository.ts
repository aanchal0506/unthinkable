import prisma from "../config/prisma.js";

const HOLD_DURATION_MS = 5 * 60 * 1000; // 5 minutes

const getActiveHold = async (doctorId: number, date: Date, startTime: string) => {
  return prisma.slotHold.findUnique({
    where: { doctorId_date_startTime: { doctorId, date, startTime } },
  });
};

// Places (or refreshes) a hold on a slot for a given patient. Throws
// "SLOT_HELD_BY_OTHER" if someone else already holds an unexpired hold on
// this exact slot. Expired holds are transparently reclaimed.
const acquireHold = async (
  doctorId: number,
  date: Date,
  startTime: string,
  patientId: number
) => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + HOLD_DURATION_MS);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.slotHold.findUnique({
      where: { doctorId_date_startTime: { doctorId, date, startTime } },
    });

    if (existing && existing.expiresAt > now && existing.patientId !== patientId) {
      throw new Error("SLOT_HELD_BY_OTHER");
    }

    return tx.slotHold.upsert({
      where: { doctorId_date_startTime: { doctorId, date, startTime } },
      update: { patientId, expiresAt },
      create: { doctorId, date, startTime, patientId, expiresAt },
    });
  });
};

const releaseHold = async (doctorId: number, date: Date, startTime: string) => {
  await prisma.slotHold.deleteMany({
    where: { doctorId, date, startTime },
  });
};

const getActiveHoldsForDoctorAndDate = async (doctorId: number, date: Date) => {
  return prisma.slotHold.findMany({
    where: { doctorId, date, expiresAt: { gt: new Date() } },
  });
};

const deleteExpiredHolds = async () => {
  const result = await prisma.slotHold.deleteMany({
    where: { expiresAt: { lte: new Date() } },
  });

  return result.count;
};

export {
  HOLD_DURATION_MS,
  getActiveHold,
  acquireHold,
  releaseHold,
  getActiveHoldsForDoctorAndDate,
  deleteExpiredHolds,
};
