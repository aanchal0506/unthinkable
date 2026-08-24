import { Request, Response } from "express";
import symptomService from "../services/symptom.service";

const submitSymptoms = async (req: Request, res: Response) => {
  try {
    const appointmentId = Number(req.params.appointmentId);
    const { symptoms } = req.body;

    const patientId = Number((req as any).user.id);

    if (!appointmentId || Number.isNaN(appointmentId)) {
      return res.status(400).json({
        message: "Invalid appointment ID",
      });
    }

    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({
        message: "Symptoms are required",
      });
    }

    const result = await symptomService.submitSymptoms(
      appointmentId,
      patientId,
      symptoms
    );

    return res.status(201).json({
      message: "Symptoms submitted successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const getSymptoms = async (req: Request, res: Response) => {
  try {
    const appointmentId = Number(req.params.appointmentId);

    const patientId = Number((req as any).user.id);

    if (!appointmentId || Number.isNaN(appointmentId)) {
      return res.status(400).json({
        message: "Invalid appointment ID",
      });
    }

    const result = await symptomService.getSymptoms(
      appointmentId,
      patientId
    );

    return res.status(200).json({
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const regenerateSummary = async (req: Request, res: Response) => {
  try {
    const appointmentId = Number(req.params.appointmentId);

    if (!appointmentId || Number.isNaN(appointmentId)) {
      return res.status(400).json({
        message: "Invalid appointment ID",
      });
    }

    const result = await symptomService.regenerateSummary(appointmentId);

    return res.status(200).json({
      message: "AI summary regeneration attempted",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export default {
  submitSymptoms,
  getSymptoms,
  regenerateSummary,
};