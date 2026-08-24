"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaveByDoctorAndDate = exports.deleteLeave = exports.getLeaveById = exports.getDoctorLeaves = exports.createLeave = void 0;
const prisma_js_1 = __importDefault(require("../config/prisma.js"));
const createLeave = async (data) => {
    return await prisma_js_1.default.doctorLeave.create({
        data,
    });
};
exports.createLeave = createLeave;
const getDoctorLeaves = async (doctorId) => {
    return await prisma_js_1.default.doctorLeave.findMany({
        where: {
            doctorId,
        },
        orderBy: {
            date: "asc",
        },
    });
};
exports.getDoctorLeaves = getDoctorLeaves;
const getLeaveById = async (id) => {
    return await prisma_js_1.default.doctorLeave.findUnique({
        where: {
            id,
        },
    });
};
exports.getLeaveById = getLeaveById;
const deleteLeave = async (id) => {
    return await prisma_js_1.default.doctorLeave.delete({
        where: {
            id,
        },
    });
};
exports.deleteLeave = deleteLeave;
const getLeaveByDoctorAndDate = async (doctorId, date) => {
    return await prisma_js_1.default.doctorLeave.findUnique({
        where: {
            doctorId_date: {
                doctorId,
                date,
            },
        },
    });
};
exports.getLeaveByDoctorAndDate = getLeaveByDoctorAndDate;
