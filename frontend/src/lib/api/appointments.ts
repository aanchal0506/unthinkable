import apiClient from "./client";

import type {
  Appointment,
  AppointmentResponse,
} from "@/types/appointment";

export const bookAppointment = async (
  doctorId: number,
  date: string,
  startTime: string
): Promise<Appointment> => {
  const response =
    await apiClient.post<AppointmentResponse>(
      "/appointments",
      {
        doctorId,
        date,
        startTime,
      }
    );

  return response.data.appointment;
};

export const submitSymptoms = async (
  appointmentId: number,
  symptoms: string
) => {
  const response = await apiClient.post(
    `/appointments/${appointmentId}/symptoms`,
    {
      symptoms,
    }
  );

  return response.data;
};

export const getMyAppointments = async (): Promise<
  Appointment[]
> => {
  const response = await apiClient.get(
    "/appointments/my"
  );

  return response.data.appointments;
};

export const getPatientAppointmentDetails =
  async (
    appointmentId: number
  ) => {
    const response = await apiClient.get(
      `/appointments/patient/appointments/${appointmentId}`
    );

    return response.data.appointment;
  };

export const getAppointmentSymptoms =
  async (
    appointmentId: number
  ) => {
    const response = await apiClient.get(
      `/appointments/${appointmentId}/symptoms`
    );

    return response.data;
  };

export const cancelAppointment = async (
  appointmentId: number,
  reason?: string
) => {
  const response =
    await apiClient.delete(
      `/appointments/${appointmentId}`,
      {
        data: {
          reason,
        },
      }
    );

  return response.data;
};