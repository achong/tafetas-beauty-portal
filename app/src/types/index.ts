export interface User {
  uid: string;
  role: 'admin' | 'student';
  name: string;
  username: string;
  email?: string;
  password: string;
  isTemp: boolean;
  services_active: string[];
}

export interface Service {
  service_id: string;
  category: string;
  name: string;
  price: number;
}

export interface ScheduleEntry {
  student_id: string;
  date: string;
  time: string;
  is_open: boolean;
}

export interface Booking {
  id: number;
  service: Service | null;
  student: string | null;
  date: string | null;
  time: string | null;
  client_name: string;
  client_email: string;
  client_phone: string;
  student_id?: string;
}

export type ViewName =
  | 'catalog'
  | 'booking'
  | 'admin-login'
  | 'admin-dashboard'
  | 'student-login'
  | 'student-dashboard';

  // app/src/types/index.ts

export interface User {
  uid: string;
  role: 'admin' | 'student' | 'client'; // ← Added 'client'
  name: string;
  username: string;
  email?: string;
  password: string;
  isTemp: boolean;
  services_active: string[];
  client_profile?: ClientProfile; // ← Optional client data
}

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
  submission_id: string;
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

// ... keep your existing Service, Booking, ScheduleEntry, ViewName interfaces below