"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpiredHolds = exports.getActiveHoldsForDoctorAndDate = exports.releaseHold = exports.acquireHold = exports.getActiveHold = exports.HOLD_DURATION_MS = void 0;
const prisma_js_1 = __importDefault(require("../config/prisma.js"));
const HOLD_DURATION_MS = 5 * 60 * 1000; // 5 minutes
exports.HOLD_DURATION_MS = HOLD_DURATION_MS;
const getActiveHold = async (doctorId, date, startTime) => {
    return prisma_js_1.default.slotHold.findUnique({
        where: { doctorId_date_startTime: { doctorId, date, startTime } },
    });
};
exports.getActiveHold = getActiveHold;
// Places (or refreshes) a hold on a slot for a given patient. Throws
// "SLOT_HELD_BY_OTHER" if someone else already holds an unexpired hold on
// this exact slot. Expired holds are transparently reclaimed.
const acquireHold = async (doctorId, date, startTime, patientId) => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + HOLD_DURATION_MS);
    return prisma_js_1.default.$transaction(async (tx) => {
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
exports.acquireHold = acquireHold;
const releaseHold = async (doctorId, date, startTime) => {
    await prisma_js_1.default.slotHold.deleteMany({
        where: { doctorId, date, startTime },
    });
};
exports.releaseHold = releaseHold;
const getActiveHoldsForDoctorAndDate = async (doctorId, date) => {
    return prisma_js_1.default.slotHold.findMany({
        where: { doctorId, date, expiresAt: { gt: new Date() } },
    });
};
exports.getActiveHoldsForDoctorAndDate = getActiveHoldsForDoctorAndDate;
const deleteExpiredHolds = async () => {
    const result = await prisma_js_1.default.slotHold.deleteMany({
        where: { expiresAt: { lte: new Date() } },
    });
    return result.count;
};
exports.deleteExpiredHolds = deleteExpiredHolds;
