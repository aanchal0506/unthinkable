import bcrypt from "bcrypt";
import * as doctorRepository from "../repositories/doctor.repository";

const createDoctor = async (
    name: string,
    email: string,
    password: string,
    specialization: string,
    qualification?: string,
    experience?: number,
    bio?: string,
    consultationFee?: number
) => {
    const existingUser = await doctorRepository.getUserByEmail(email);

    if (existingUser) {
        throw new Error("A user with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await doctorRepository.createDoctorUser(
        name,
        email,
        hashedPassword
    );

    try {
        const doctor = await doctorRepository.createDoctor(
            user.id,
            specialization,
            qualification,
            experience,
            bio,
            consultationFee
        );

        return doctor;
    } catch (error) {
        // If doctor profile creation fails,
        // remove the user that was just created.
        await doctorRepository.deleteUser(user.id);

        throw error;
    }
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