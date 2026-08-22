import { Request, Response } from "express";
import * as reminderService from "../services/reminder.service";

const getPrescriptionReminders = async (
  req: Request,
  res: Response
) => {
  try {
    const prescriptionId = Number(
      req.params.prescriptionId
    );

    if (!prescriptionId || Number.isNaN(prescriptionId)) {
      return res.status(400).json({
        message: "Invalid prescription ID",
      });
    }

    const reminders =
      await reminderService.getRemindersByPrescription(
        prescriptionId
      );

    return res.status(200).json({
      message: "Reminders fetched successfully",
      reminders,
    });
  } catch (error: any) {
    console.error("Get reminders error:", error);

    return res.status(400).json({
      message: error.message || "Failed to fetch reminders",
    });
  }
};

export {
  getPrescriptionReminders,
};