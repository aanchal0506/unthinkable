import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();


import authRoutes from "./src/routes/auth.routes";
import doctorRoutes from "./src/routes/doctor.route";
import availabilityRoutes from "./src/routes/avl.route";
import slotRoutes from "./src/routes/slot.route";
import appointmentRoutes from "./src/routes/appointment.route";
import leaveRoutes from "./src/routes/leave.route";
import symptomRoutes from "./src/routes/symptom.route";
import consultationRoutes from "./src/routes/consultation.route";
import reminderRoutes from "./src/routes/reminder.route";
import googleAuthRoutes from "./src/routes/googleAuth.route";

import { generalLimiter, authLimiter } from "./src/middleware/rateLimiter.middleware";
import { notFoundHandler, errorHandler } from "./src/middleware/errorHandler.middleware";

import startReminderJob from "./src/jobs/reminder.job";
import startAppointmentReminderJob from "./src/jobs/appointmentReminder.job";
import startNotificationRetryJob from "./src/jobs/notification.job";
import startSlotHoldCleanupJob from "./src/jobs/slotHoldCleanup.job";


const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(generalLimiter);

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Healthcare Appointment Manager API is running",
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors/leaves", leaveRoutes);
app.use("/api", symptomRoutes);
app.use("/api", consultationRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/google", googleAuthRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  startReminderJob();
  startAppointmentReminderJob();
  startNotificationRetryJob();
  startSlotHoldCleanupJob();
});

// Prevent an unhandled promise rejection (e.g. inside a cron job) from
// silently killing the process without a trace.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});
