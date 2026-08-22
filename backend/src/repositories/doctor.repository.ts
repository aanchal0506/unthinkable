import prisma from "../config/prisma";

const createDoctor = async (
    userId: number,
    specialization: string,
    qualification?: string,
    experience?: number,
    bio?: string,
    consultationFee?: number
) => {
    return await prisma.doctorProfile.create({
        data: {
            userId,
            specialization,
            qualification,
            experience,
            bio,
            consultationFee,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
};

const getAllDoctors = async (specialization?: string) => {
    return await prisma.doctorProfile.findMany({
        where: specialization
            ? {
                  specialization: {
                      contains: specialization,
                      mode: "insensitive",
                  },
              }
            : undefined,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

const getDoctorById = async (id: number) => {
    return await prisma.doctorProfile.findUnique({
        where: {
            id,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
};

const getDoctorByUserId = async (userId: number) => {
    return await prisma.doctorProfile.findUnique({
        where: {
            userId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
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
    return await prisma.doctorProfile.update({
        where: {
            id,
        },
        data,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
};

const deleteDoctor = async (id: number) => {
    return await prisma.doctorProfile.delete({
        where: {
            id,
        },
    });
};


const getUserByEmail = async (email: string) => {
    return await prisma.user.findUnique({
        where: {
            email,
        },
    });
};

const createDoctorUser = async (
    name: string,
    email: string,
    password: string
) => {
    return await prisma.user.create({
        data: {
            name,
            email,
            password,
            role: "DOCTOR",
        },
    });
};

const deleteUser = async (userId: number) => {
    return await prisma.user.delete({
        where: {
            id: userId,
        },
    });
};


export {
    createDoctor,
    getAllDoctors,
    getDoctorById,
    getDoctorByUserId,
    updateDoctor,
    deleteDoctor,
    getUserByEmail,
    createDoctorUser,
    deleteUser,
};