export interface Doctor {
  id: number;
  userId?: number;
  name: string;
  email?: string;
  specialisation: string;
  specialization?: string;
  qualification?: string;
  experience?: number;
  bio?: string;
  consultationFee?: number;
}

export interface DoctorResponse {
  doctors: Doctor[];
}

export interface DoctorDetailResponse {
  doctor: Doctor;
}