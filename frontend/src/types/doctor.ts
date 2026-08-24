export interface Doctor {
  id: number;
  userId?: number;
  name: string;
  email?: string;
  specialization: string;
  qualification?: string | null;
  experience?: number | null;
  bio?: string | null;
  consultationFee?: number | null;
}

export interface DoctorResponse {
  doctors: BackendDoctor[];
}

export interface BackendDoctor {
  id: number;
  specialization: string;
  qualification?: string | null;
  experience?: number | null;
  bio?: string | null;
  consultationFee?: number | null;
  user: {
    id: number;
    name: string;
    email?: string;
    role?: string;
  };
}

export interface DoctorDetailResponse {
  doctor: BackendDoctor;
}