import apiClient from "./client";
import type { DoctorAvailability } from "@/types/availability";

export const getDoctorAvailability = async (
  doctorId: number
): Promise<DoctorAvailability[]> => {
  const response = await apiClient.get(`/availability/doctor/${doctorId}`);

  return response.data.availability;
};

export interface AvailabilityInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

export const createAvailability = async (
  doctorId: number,
  data: AvailabilityInput
): Promise<DoctorAvailability> => {
  const response = await apiClient.post(
    `/availability/doctor/${doctorId}`,
    data
  );

  return response.data.availability;
};

export const updateAvailability = async (
  id: number,
  data: Partial<AvailabilityInput>
): Promise<DoctorAvailability> => {
  const response = await apiClient.put(`/availability/${id}`, data);

  return response.data.availability;
};

export const deleteAvailability = async (id: number) => {
  const response = await apiClient.delete(`/availability/${id}`);

  return response.data;
};
