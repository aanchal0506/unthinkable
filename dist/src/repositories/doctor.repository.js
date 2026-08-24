"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.createDoctorUser = exports.getUserByEmail = exports.deleteDoctor = exports.updateDoctor = exports.getDoctorByUserId = exports.getDoctorById = exports.getAllDoctors = exports.createDoctor = void 0;
const prisma_js_1 = __importDefault(require("../config/prisma.js"));
const createDoctor = async (data) => {
    return await prisma_js_1.default.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: data.password,
                role: "DOCTOR",
            },
        });
        const doctor = await tx.doctorProfile.create({
            data: {
                userId: user.id,
                specialization: data.specialization,
                qualification: data.qualification,
                experience: data.experience,
                bio: data.bio,
                consultationFee: data.consultationFee,
            },
        });
        return {
            user,
            doctor,
        };
    });
};
exports.createDoctor = createDoctor;
const getAllDoctors = async (specialization, name) => {
    return await prisma_js_1.default.doctorProfile.findMany({
        where: {
            ...(specialization
                ? {
                    specialization: {
                        contains: specialization,
                        mode: "insensitive",
                    },
                }
                : {}),
            ...(name
                ? {
                    user: {
                        name: {
                            contains: name,
                            mode: "insensitive",
                        },
                    },
                }
                : {}),
        },
        select: {
            id: true,
            specialization: true,
            qualification: true,
            experience: true,
            bio: true,
            consultationFee: true,
            user: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
exports.getAllDoctors = getAllDoctors;
const getDoctorById = async (id) => {
    return await prisma_js_1.default.doctorProfile.findUnique({
        where: {
            id,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
};
exports.getDoctorById = getDoctorById;
const getDoctorByUserId = async (userId) => {
    return await prisma_js_1.default.doctorProfile.findUnique({
        where: {
            userId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
};
exports.getDoctorByUserId = getDoctorByUserId;
const updateDoctor = async (id, data) => {
    return await prisma_js_1.default.doctorProfile.update({
        where: {
            id,
        },
        data,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
};
exports.updateDoctor = updateDoctor;
const deleteDoctor = async (id) => {
    return await prisma_js_1.default.doctorProfile.delete({
        where: {
            id,
        },
    });
};
exports.deleteDoctor = deleteDoctor;
const getUserByEmail = async (email) => {
    return await prisma_js_1.default.user.findUnique({
        where: {
            email,
        },
    });
};
exports.getUserByEmail = getUserByEmail;
const createDoctorUser = async (name, email, password) => {
    return await prisma_js_1.default.user.create({
        data: {
            name,
            email,
            password,
            role: "DOCTOR",
        },
    });
};
exports.createDoctorUser = createDoctorUser;
const deleteUser = async (userId) => {
    return await prisma_js_1.default.user.delete({
        where: {
            id: userId,
        },
    });
};
exports.deleteUser = deleteUser;
