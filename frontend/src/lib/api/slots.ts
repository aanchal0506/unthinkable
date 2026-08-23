import apiClient from "./client";
import type {
  TimeSlot,
  SlotsResponse,
  HoldResponse,
} from "@/types/appointment";

export const getAvailableSlots = async (
  doctorId: number,
  date: string
): Promise<TimeSlot[]> => {
  const response = await apiClient.get<SlotsResponse>(
    `/slots/doctor/${doctorId}`,
    {
      params: {
        date,
      },
    }
  );

  return response.data.slots;
};

export const holdSlot = async (
  doctorId: number,
  date: string,
  startTime: string
): Promise<HoldResponse> => {
  const response = await apiClient.post<HoldResponse>(
    "/slots/hold",
    {
      doctorId,
      date,
      startTime,
    }
  );

  return response.data;
};

export const releaseSlot = async (
  doctorId: number,
  date: string,
  startTime: string
) => {
  const response = await apiClient.post(
    "/slots/release",
    {
      doctorId,
      date,
      startTime,
    }
  );

  return response.data;
};