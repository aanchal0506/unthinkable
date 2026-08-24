export interface DoctorLeave {
  id: number;
  doctorId: number;
  date: string;
  reason: string | null;
  createdAt: string;
}
