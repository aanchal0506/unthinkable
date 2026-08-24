import { Request, Response } from "express";

import * as leaveService from "../services/leave.service";

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: "PATIENT" | "DOCTOR" | "ADMIN";
  };
}

// Create leave
const createLeave = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (req.user.role !== "DOCTOR") {
      return res.status(403).json({
        message: "Only doctors can create leaves",
      });
    }

    const { date, reason } = req.body;

    if (!date) {
      return res.status(400).json({
        message: "Date is required",
      });
    }

    const result = await leaveService.createLeave(
      req.user.id,
      date,
      reason
    );

    return res.status(201).json({
      message:
        result.affectedAppointments > 0
          ? `Leave created successfully. ${result.affectedAppointments} existing appointment(s) were cancelled and the affected patient(s) notified.`
          : "Leave created successfully",
      leave: result.leave,
      affectedAppointments: result.affectedAppointments,
    });
  } catch (error: any) {
    console.error("Create leave error:", error);

    if (
      error.message ===
      "Doctor profile not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error.message === "Invalid date") {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (
      error.message ===
      "Leave already exists for this date"
    ) {
      return res.status(409).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to create leave",
    });
  }
};

// Get logged-in doctor's leaves
const getMyLeaves = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (req.user.role !== "DOCTOR") {
      return res.status(403).json({
        message: "Only doctors can access this",
      });
    }

    const leaves =
      await leaveService.getMyLeaves(
        req.user.id
      );

    return res.status(200).json({
      leaves,
    });
  } catch (error: any) {
    console.error(
      "Get leaves error:",
      error
    );

    if (
      error.message ===
      "Doctor profile not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to fetch leaves",
    });
  }
};

// Delete leave
const deleteLeave = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (req.user.role !== "DOCTOR") {
      return res.status(403).json({
        message: "Only doctors can delete leaves",
      });
    }

    const leaveId = Number(req.params.id);

    if (isNaN(leaveId)) {
      return res.status(400).json({
        message: "Invalid leave ID",
      });
    }

    const leave =
      await leaveService.deleteLeave(
        req.user.id,
        leaveId
      );

    return res.status(200).json({
      message: "Leave deleted successfully",
      leave,
    });
  } catch (error: any) {
    console.error(
      "Delete leave error:",
      error
    );

    if (
      error.message ===
        "Doctor profile not found" ||
      error.message === "Leave not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (
      error.message ===
      "You can only delete your own leaves"
    ) {
      return res.status(403).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to delete leave",
    });
  }
};

export {
  createLeave,
  getMyLeaves,
  deleteLeave,
};