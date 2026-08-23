import apiClient from "./client";
import type {
  Doctor,
  DoctorResponse,
  DoctorDetailResponse,
  BackendDoctor,
} from "@/types/doctor";

const normalizeDoctor = (
  doctor: BackendDoctor
): Doctor => {
  return {
    id: doctor.id,
    userId: doctor.user.id,
    name: doctor.user.name,
    email: doctor.user.email,
    specialization: doctor.specialization,
    qualification: doctor.qualification,
    experience: doctor.experience,
    bio: doctor.bio,
    consultationFee: doctor.consultationFee,
  };
};

export const getDoctors = async (
  specialization?: string
): Promise<Doctor[]> => {
  const response = await apiClient.get<DoctorResponse>(
    "/doctors",
    {
      params: specialization
        ? { specialization }
        : undefined,
    }
  );

  return response.data.doctors.map(normalizeDoctor);
};

export const getDoctorById = async (
  doctorId: number
): Promise<Doctor> => {
  const response =
    await apiClient.get<DoctorDetailResponse>(
      `/doctors/${doctorId}`
    );

  return normalizeDoctor(response.data.doctor);
};