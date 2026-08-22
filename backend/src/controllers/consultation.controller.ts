import { Request, Response } from "express";
import consultationService from "../services/consultation.service";

const createConsultation = async (req: Request, res: Response) => {
  try {
    const appointmentId = Number(req.params.appointmentId);

    const {
      clinicalNotes,
      diagnosis,
      followUpInstructions,
      prescriptions,
    } = req.body;

    const doctorUserId = Number((req as any).user.id);

    if (!appointmentId || Number.isNaN(appointmentId)) {
      return res.status(400).json({
        message: "Invalid appointment ID",
      });
    }

    const consultation =
      await consultationService.createConsultation(
        appointmentId,
        doctorUserId,
        clinicalNotes,
        diagnosis,
        followUpInstructions,
        prescriptions
      );

    return res.status(201).json({
      message: "Consultation created successfully",
      consultation,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const getConsultation = async (req: Request, res: Response) => {
  try {
    const appointmentId = Number(req.params.appointmentId);

    const doctorUserId = Number((req as any).user.id);

    if (!appointmentId || Number.isNaN(appointmentId)) {
      return res.status(400).json({
        message: "Invalid appointment ID",
      });
    }

    const consultation =
      await consultationService.getConsultation(
        appointmentId,
        doctorUserId
      );

    if (!consultation) {
      return res.status(404).json({
        message: "Consultation not found",
      });
    }

    return res.status(200).json({
      consultation,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export default {
  createConsultation,
  getConsultation,
};