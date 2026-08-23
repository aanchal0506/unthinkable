import { Request, Response } from "express";

import * as slotService from "../services/slot.service";

const getAvailableSlots = async (
  req: Request,
  res: Response
) => {
  try {
    const doctorId = Number(req.params.doctorId);

    const { date } = req.query;

    if (isNaN(doctorId)) {
      return res.status(400).json({
        message: "Invalid doctor ID",
      });
    }

    if (!date || typeof date !== "string") {
      return res.status(400).json({
        message: "Date is required",
      });
    }

    const slots = await slotService.getAvailableSlots(
      doctorId,
      date
    );

    return res.status(200).json({
      doctorId,
      date,
      slots,
    });
  } catch (error: any) {
    console.error("Get slots error:", error);

    if (error.message === "Doctor not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to fetch available slots",
    });
  }
};

interface AuthRequest extends Request {
  user?: { id: number; role: "PATIENT" | "DOCTOR" | "ADMIN" };
}

const holdSlot = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.role !== "PATIENT") {
      return res.status(403).json({ message: "Only patients can hold slots" });
    }

    const { doctorId, date, startTime } = req.body;

    if (!doctorId || !date || !startTime) {
      return res.status(400).json({
        message: "doctorId, date and startTime are required",
      });
    }

    const hold = await slotService.holdSlot(
      Number(doctorId),
      date,
      startTime,
      req.user.id
    );

    return res.status(200).json({
      message: "Slot held successfully",
      ...hold,
    });
  } catch (error: any) {
    console.error("Hold slot error:", error);

    if (error.message.includes("currently held")) {
      return res.status(409).json({ message: error.message });
    }

    if (
      error.message === "Doctor not found" ||
      error.message === "Patient profile not found"
    ) {
      return res.status(404).json({ message: error.message });
    }

    if (
      error.message === "Invalid date" ||
      error.message === "Selected time slot is not available"
    ) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Failed to hold slot" });
  }
};

const releaseSlotHold = async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId, date, startTime } = req.body;

    if (!doctorId || !date || !startTime) {
      return res.status(400).json({
        message: "doctorId, date and startTime are required",
      });
    }

    const result = await slotService.releaseSlotHold(
      Number(doctorId),
      date,
      startTime
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Release hold error:", error);

    return res.status(500).json({ message: "Failed to release hold" });
  }
};

export {
  getAvailableSlots,
  holdSlot,
  releaseSlotHold,
};