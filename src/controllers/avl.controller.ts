import { Request, Response } from "express";

import * as availabilityService from "../services/avl.service";

const createAvailability = async (
  req: Request,
  res: Response
) => {
  try {
    const doctorId = Number(req.params.doctorId);

    const {
      dayOfWeek,
      startTime,
      endTime,
      slotDuration,
    } = req.body;

    if (isNaN(doctorId)) {
      return res.status(400).json({
        message: "Invalid doctor ID",
      });
    }

    if (
      dayOfWeek === undefined ||
      !startTime ||
      !endTime ||
      slotDuration === undefined
    ) {
      return res.status(400).json({
        message:
          "dayOfWeek, startTime, endTime and slotDuration are required",
      });
    }

    const availability =
      await availabilityService.createAvailability(
        doctorId,
        Number(dayOfWeek),
        startTime,
        endTime,
        Number(slotDuration)
      );

    return res.status(201).json({
      message: "Availability created successfully",
      availability,
    });
  } catch (error: any) {
    console.error(
      "Create availability error:",
      error
    );

    if (
      error.message === "Doctor not found" ||
      error.message.includes("must be")
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    // Prisma unique constraint
    if (error.code === "P2002") {
      return res.status(409).json({
        message:
          "Availability already exists for this day",
      });
    }

    return res.status(500).json({
      message: "Failed to create availability",
    });
  }
};

const getDoctorAvailability = async (
  req: Request,
  res: Response
) => {
  try {
    const doctorId = Number(req.params.doctorId);

    if (isNaN(doctorId)) {
      return res.status(400).json({
        message: "Invalid doctor ID",
      });
    }

    const availability =
      await availabilityService.getDoctorAvailability(
        doctorId
      );

    return res.status(200).json({
      availability,
    });
  } catch (error: any) {
    console.error(
      "Get availability error:",
      error
    );

    if (error.message === "Doctor not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to fetch availability",
    });
  }
};

const updateAvailability = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid availability ID",
      });
    }

    const {
      dayOfWeek,
      startTime,
      endTime,
      slotDuration,
    } = req.body;

    const availability =
      await availabilityService.updateAvailability(id, {
        dayOfWeek:
          dayOfWeek !== undefined
            ? Number(dayOfWeek)
            : undefined,

        startTime,
        endTime,

        slotDuration:
          slotDuration !== undefined
            ? Number(slotDuration)
            : undefined,
      });

    return res.status(200).json({
      message: "Availability updated successfully",
      availability,
    });
  } catch (error: any) {
    console.error(
      "Update availability error:",
      error
    );

    if (
      error.message === "Availability not found" ||
      error.message.includes("must be")
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        message:
          "Availability already exists for this day",
      });
    }

    return res.status(500).json({
      message: "Failed to update availability",
    });
  }
};

const deleteAvailability = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid availability ID",
      });
    }

    const result =
      await availabilityService.deleteAvailability(id);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error(
      "Delete availability error:",
      error
    );

    if (error.message === "Availability not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to delete availability",
    });
  }
};

export {
  createAvailability,
  getDoctorAvailability,
  updateAvailability,
  deleteAvailability,
};