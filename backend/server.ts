import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./src/routes/auth.routes";
import doctorRoutes from "./src/routes/doctor.route";
import availabilityRoutes from "./src/routes/avl.route";
import slotRoutes from "./src/routes/slot.route";
import appointmentRoutes from "./src/routes/appointment.route";
import leaveRoutes from "./src/routes/leave.route";
import symptomRoutes from "./src/routes/symptom.route";
import consultationRoutes from "./src/routes/consultation.route";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Healthcare Appointment Manager API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors/leaves", leaveRoutes);
app.use("/api", symptomRoutes);
app.use("/api", consultationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});