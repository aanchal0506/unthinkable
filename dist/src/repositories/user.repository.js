"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGoogleTokens = exports.getPublicProfileById = exports.getUserById = exports.getPatientProfileByUserId = exports.createUser = exports.findUserByEmail = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const findUserByEmail = async (email) => {
    return await prisma_1.default.user.findUnique({
        where: {
            email,
        },
    });
};
exports.findUserByEmail = findUserByEmail;
const createUser = async (data) => {
    return await prisma_1.default.user.create({
        data,
    });
};
exports.createUser = createUser;
const getPatientProfileByUserId = async (userId) => {
    return await prisma_1.default.patientProfile.findUnique({
        where: {
            userId,
        },
    });
};
exports.getPatientProfileByUserId = getPatientProfileByUserId;
const getUserById = async (id) => {
    return await prisma_1.default.user.findUnique({ where: { id } });
};
exports.getUserById = getUserById;
const getPublicProfileById = async (id) => {
    return await prisma_1.default.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            googleCalendarLinked: true,
        },
    });
};
exports.getPublicProfileById = getPublicProfileById;
const updateGoogleTokens = async (userId, data) => {
    return await prisma_1.default.user.update({
        where: { id: userId },
        data,
    });
};
exports.updateGoogleTokens = updateGoogleTokens;
