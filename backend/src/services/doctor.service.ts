import bcrypt from "bcrypt";
import * as doctorRepository from "../repositories/doctor.repository";
import * as userRepository from "../repositories/user.repository";

const createDoctor = async (data: {
  name: string;
  email: string;
  password: string;
  specialization: string;
  qualification?: string;
  experience?: number;
  bio?: string;
  consultationFee?: number;
}) => {
  // Check whether email already exists
  const existingUser =
    await userRepository.findUserByEmail(data.email);

  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    data.password,
    10
  );

  const result =
    await doctorRepository.createDoctor({
      ...data,
      password: hashedPassword,
    });

  return {
    id: result.doctor.id,
    userId: result.user.id,
    name: result.user.name,
    email: result.user.email,
    specialization:
      result.doctor.specialization,
    qualification:
      result.doctor.qualification,
    experience:
      result.doctor.experience,
    bio: result.doctor.bio,
    consultationFee:
      result.doctor.consultationFee,
  };
};

const getDoctors = async (specialization?: string) => {
    return await doctorRepository.getAllDoctors(specialization);
};

const getDoctor = async (id: number) => {
    const doctor = await doctorRepository.getDoctorById(id);

    if (!doctor) {
        throw new Error("Doctor not found");
    }

    return doctor;
};

const updateDoctor = async (
    id: number,
    data: {
        specialization?: string;
        qualification?: string;
        experience?: number;
        bio?: string;
        consultationFee?: number;
    }
) => {
    const doctor = await doctorRepository.getDoctorById(id);

    if (!doctor) {
        throw new Error("Doctor not found");
    }

    return await doctorRepository.updateDoctor(id, data);
};

const deleteDoctor = async (id: number) => {
    const doctor = await doctorRepository.getDoctorById(id);

    if (!doctor) {
        throw new Error("Doctor not found");
    }

    await doctorRepository.deleteDoctor(id);

    return {
        message: "Doctor deleted successfully",
    };
};

export {
    createDoctor,
    getDoctors,
    getDoctor,
    updateDoctor,
    deleteDoctor,
};