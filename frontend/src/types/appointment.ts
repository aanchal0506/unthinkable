export interface Appointment {
  id: number;
  doctorId: number;
  patientId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: "BOOKED" | "COMPLETED" | "CANCELLED";
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface SlotsResponse {
  doctorId: number;
  date: string;
  slots: TimeSlot[];
}

export interface AppointmentResponse {
  message: string;
  appointment: Appointment;
}

export interface HoldResponse {
  message: string;
  holdId: number;
  expiresAt: string;
}