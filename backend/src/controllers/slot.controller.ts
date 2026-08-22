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

export {
  getAvailableSlots,
};