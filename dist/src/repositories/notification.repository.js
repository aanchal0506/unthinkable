"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markRetryFailed = exports.markSent = exports.getFailedForRetry = exports.createLog = void 0;
const prisma_js_1 = __importDefault(require("../config/prisma.js"));
const createLog = async (data) => {
    return prisma_js_1.default.notificationLog.create({
        data: {
            type: data.type,
            recipient: data.recipient,
            subject: data.subject,
            payload: { html: data.html },
            appointmentId: data.appointmentId,
            status: data.status,
            attempts: 1,
            lastError: data.lastError,
        },
    });
};
exports.createLog = createLog;
const getFailedForRetry = async (maxAttempts) => {
    return prisma_js_1.default.notificationLog.findMany({
        where: {
            status: "FAILED",
            attempts: { lt: maxAttempts },
        },
        orderBy: { createdAt: "asc" },
        take: 50,
    });
};
exports.getFailedForRetry = getFailedForRetry;
const markSent = async (id) => {
    return prisma_js_1.default.notificationLog.update({
        where: { id },
        data: { status: "SENT" },
    });
};
exports.markSent = markSent;
const markRetryFailed = async (id, error) => {
    return prisma_js_1.default.notificationLog.update({
        where: { id },
        data: {
            attempts: { increment: 1 },
            lastError: error,
        },
    });
};
exports.markRetryFailed = markRetryFailed;
