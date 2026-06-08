// src/types/index.ts

export interface User {
  uid: string;
  role: 'admin' | 'student' | 'client'; // Added 'client'
  name: string;
  username: string;
  email?: string;
  password: string;
  isTemp: boolean;
  services_active: string[];
  client_profile?: ClientProfile;
}

export interface Service {
  service_id: string;
  name: string;
  duration?: number; // Made optional to fix useClinicData error
  price: number;
  category: string;
  description?: string;
}

export interface Booking {
  id?: number | string;
  booking_id?: string;
  service?: any; // Existing code passes the whole service object
  service_id?: string;
  student?: string;
  student_id?: string; // Existing code uses student_id
  student_uid?: string;
  date: string;
  time?: string; // Existing code uses time
  start_time?: string;
  end_time?: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  client_uid?: string;
  status?: string;
  notes?: string;
  form_submissions?: string[];
}

export interface ScheduleEntry {
  id?: string;
  date: string;
  time?: string; // Existing code uses time
  start_time?: string;
  end_time?: string;
  student_id?: string; // Existing code uses student_id
  is_open?: boolean; // Existing code uses is_open
  available_students?: string[];
}

export type ViewName = 
  | 'catalog' 
  | 'booking' 
  | 'admin-login' 
  | 'admin-dashboard' 
  | 'student-login' 
  | 'student-dashboard';

// --- NEW FORM TYPES ---
export interface Form {
  form_id: string;
  service_id: string;
  title: string;
  description?: string;
  fields: FormField[];
  is_required: boolean;
  created_at: string;
}

export interface FormField {
  field_id: string;
  label: string;
  type: 'text' | 'textarea' | 'checkbox' | 'radio' | 'select' | 'date' | 'signature' | 'number';
  required: boolean;
  options?: string[];
  placeholder?: string;
  helper_text?: string;
}

export interface FormSubmission {
  submission_id?: string;
  form_id: string;
  client_uid: string;
  booking_id?: string;
  responses: FormResponse[];
  submitted_at: string;
  is_signed: boolean;
  signature_data?: string;
}

export interface FormResponse {
  field_id: string;
  value: string | boolean | string[] | number;
}

export interface ClientProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  emergency_contact?: { name: string; phone: string; relationship: string };
  medical_conditions?: string;
  allergies?: string;
  consent_treatment: boolean;
  created_at: string;
  updated_at: string;
}