import { Request, Response } from "express";
import * as doctorService from "../services/doctor.service";

const createDoctor = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      email,
      password,
      specialization,
      qualification,
      experience,
      bio,
      consultationFee,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !specialization
    ) {
      return res.status(400).json({
        message:
          "Name, email, password and specialization are required",
      });
    }

    const doctor =
      await doctorService.createDoctor({
        name,
        email,
        password,
        specialization,
        qualification,
        experience:
          experience !== undefined
            ? Number(experience)
            : undefined,
        bio,
        consultationFee:
          consultationFee !== undefined
            ? Number(consultationFee)
            : undefined,
      });

    return res.status(201).json({
      message: "Doctor created successfully",
      doctor,
    });
  } catch (error: any) {
    console.error(
      "Create doctor error:",
      error
    );

    if (
      error.message === "User already exists"
    ) {
      return res.status(409).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to create doctor",
    });
  }
};


const getDoctors = async (req: Request, res: Response) => {
    try {
        const specialization =
            typeof req.query.specialization === "string"
                ? req.query.specialization
                : undefined;

        const doctors = await doctorService.getDoctors(
            specialization
        );

        return res.status(200).json({
            doctors,
        });
    } catch (error) {
        console.error("Get doctors error:", error);

        return res.status(500).json({
            message: "Failed to fetch doctors",
        });
    }
};

const getDoctor = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                message: "Invalid doctor ID",
            });
        }

        const doctor = await doctorService.getDoctor(id);

        return res.status(200).json({
            doctor,
        });
    } catch (error: any) {
        console.error("Get doctor error:", error);

        if (error.message === "Doctor not found") {
            return res.status(404).json({
                message: error.message,
            });
        }

        return res.status(500).json({
            message: "Failed to fetch doctor",
        });
    }
};

const updateDoctor = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                message: "Invalid doctor ID",
            });
        }

        const {
            specialization,
            qualification,
            experience,
            bio,
            consultationFee,
        } = req.body;

        const doctor = await doctorService.updateDoctor(id, {
            specialization,
            qualification,
            experience,
            bio,
            consultationFee,
        });

        return res.status(200).json({
            message: "Doctor updated successfully",
            doctor,
        });
    } catch (error: any) {
        console.error("Update doctor error:", error);

        if (error.message === "Doctor not found") {
            return res.status(404).json({
                message: error.message,
            });
        }

        return res.status(500).json({
            message: "Failed to update doctor",
        });
    }
};

const deleteDoctor = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                message: "Invalid doctor ID",
            });
        }

        const result = await doctorService.deleteDoctor(id);

        return res.status(200).json(result);
    } catch (error: any) {
        console.error("Delete doctor error:", error);

        if (error.message === "Doctor not found") {
            return res.status(404).json({
                message: error.message,
            });
        }

        return res.status(500).json({
            message: "Failed to delete doctor",
        });
    }
};

export {
    createDoctor,
    getDoctors,
    getDoctor,
    updateDoctor,
    deleteDoctor,
};