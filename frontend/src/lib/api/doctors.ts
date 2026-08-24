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

export interface CreateDoctorInput {
  name: string;
  email: string;
  password: string;
  specialization: string;
  qualification?: string;
  experience?: number;
  bio?: string;
  consultationFee?: number;
}

// Admin only. The backend's create-doctor response is a flat object (no
// nested `user`), unlike the list/detail endpoints, so it's normalized
// separately rather than reusing normalizeDoctor.
export const createDoctor = async (
  data: CreateDoctorInput
): Promise<Doctor> => {
  const response = await apiClient.post("/doctors", data);

  const doctor = response.data.doctor;

  return {
    id: doctor.id,
    userId: doctor.userId,
    name: doctor.name,
    email: doctor.email,
    specialization: doctor.specialization,
    qualification: doctor.qualification,
    experience: doctor.experience,
    bio: doctor.bio,
    consultationFee: doctor.consultationFee,
  };
};

export const updateDoctor = async (
  doctorId: number,
  data: Partial<{
    specialization: string;
    qualification: string;
    experience: number;
    bio: string;
    consultationFee: number;
  }>
): Promise<Doctor> => {
  const response = await apiClient.put<DoctorDetailResponse>(
    `/doctors/${doctorId}`,
    data
  );

  return normalizeDoctor(response.data.doctor);
};

export const deleteDoctor = async (doctorId: number) => {
  const response = await apiClient.delete(`/doctors/${doctorId}`);

  return response.data;
};