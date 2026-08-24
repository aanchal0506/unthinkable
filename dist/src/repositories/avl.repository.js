"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAvailability = exports.updateAvailability = exports.getAvailabilityById = exports.getDoctorAvailability = exports.createAvailability = void 0;
const prisma_js_1 = __importDefault(require("../config/prisma.js"));
const createAvailability = async (doctorId, dayOfWeek, startTime, endTime, slotDuration) => {
    return await prisma_js_1.default.doctorAvailability.create({
        data: {
            doctorId,
            dayOfWeek,
            startTime,
            endTime,
            slotDuration,
        },
    });
};
exports.createAvailability = createAvailability;
const getDoctorAvailability = async (doctorId) => {
    return await prisma_js_1.default.doctorAvailability.findMany({
        where: {
            doctorId,
        },
        orderBy: {
            dayOfWeek: "asc",
        },
    });
};
exports.getDoctorAvailability = getDoctorAvailability;
const getAvailabilityById = async (id) => {
    return await prisma_js_1.default.doctorAvailability.findUnique({
        where: {
            id,
        },
    });
};
exports.getAvailabilityById = getAvailabilityById;
const updateAvailability = async (id, data) => {
    return await prisma_js_1.default.doctorAvailability.update({
        where: {
            id,
        },
        data,
    });
};
exports.updateAvailability = updateAvailability;
const deleteAvailability = async (id) => {
    return await prisma_js_1.default.doctorAvailability.delete({
        where: {
            id,
        },
    });
};
exports.deleteAvailability = deleteAvailability;
