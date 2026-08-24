export interface DoctorAvailability {
  id: number;
  doctorId: number;
  dayOfWeek: number; // 0 = Sunday ... 6 = Saturday
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  slotDuration: number; // minutes
  createdAt: string;
  updatedAt: string;
}
