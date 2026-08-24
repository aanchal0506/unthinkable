"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const auth_routes_1 = __importDefault(require("./src/routes/auth.routes"));
const doctor_route_1 = __importDefault(require("./src/routes/doctor.route"));
const avl_route_1 = __importDefault(require("./src/routes/avl.route"));
const slot_route_1 = __importDefault(require("./src/routes/slot.route"));
const appointment_route_1 = __importDefault(require("./src/routes/appointment.route"));
const leave_route_1 = __importDefault(require("./src/routes/leave.route"));
const symptom_route_1 = __importDefault(require("./src/routes/symptom.route"));
const consultation_route_1 = __importDefault(require("./src/routes/consultation.route"));
const reminder_route_1 = __importDefault(require("./src/routes/reminder.route"));
const googleAuth_route_1 = __importDefault(require("./src/routes/googleAuth.route"));
const rateLimiter_middleware_1 = require("./src/middleware/rateLimiter.middleware");
const errorHandler_middleware_1 = require("./src/middleware/errorHandler.middleware");
const reminder_job_1 = __importDefault(require("./src/jobs/reminder.job"));
const appointmentReminder_job_1 = __importDefault(require("./src/jobs/appointmentReminder.job"));
const notification_job_1 = __importDefault(require("./src/jobs/notification.job"));
const slotHoldCleanup_job_1 = __importDefault(require("./src/jobs/slotHoldCleanup.job"));
const app = (0, express_1.default)();
app.set("trust proxy", 1);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
}));
app.use(express_1.default.json({ limit: "1mb" }));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(rateLimiter_middleware_1.generalLimiter);
app.get("/", (req, res) => {
    res.json({
        message: "Healthcare Appointment Manager API is running",
    });
});
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.use("/api/auth", rateLimiter_middleware_1.authLimiter, auth_routes_1.default);
app.use("/api/doctors", doctor_route_1.default);
app.use("/api/availability", avl_route_1.default);
app.use("/api/slots", slot_route_1.default);
app.use("/api/appointments", appointment_route_1.default);
app.use("/api/doctors/leaves", leave_route_1.default);
app.use("/api", symptom_route_1.default);
app.use("/api", consultation_route_1.default);
app.use("/api/reminders", reminder_route_1.default);
app.use("/api/google", googleAuth_route_1.default);
app.use(errorHandler_middleware_1.notFoundHandler);
app.use(errorHandler_middleware_1.errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    (0, reminder_job_1.default)();
    (0, appointmentReminder_job_1.default)();
    (0, notification_job_1.default)();
    (0, slotHoldCleanup_job_1.default)();
});
// Prevent an unhandled promise rejection (e.g. inside a cron job) from
// silently killing the process without a trace.
process.on("unhandledRejection", (reason) => {
    console.error("Unhandled promise rejection:", reason);
});
