import apiClient from "./client";
import type { DoctorLeave } from "@/types/leave";

export const createLeave = async (
  date: string,
  reason?: string
): Promise<{ leave: DoctorLeave; affectedAppointments: number }> => {
  const response = await apiClient.post("/doctors/leaves", {
    date,
    reason,
  });

  return {
    leave: response.data.leave,
    affectedAppointments: response.data.affectedAppointments ?? 0,
  };
};

export const getMyLeaves = async (): Promise<DoctorLeave[]> => {
  const response = await apiClient.get("/doctors/leaves/my");

  return response.data.leaves;
};

export const deleteLeave = async (id: number) => {
  const response = await apiClient.delete(`/doctors/leaves/${id}`);

  return response.data;
};
