// app/src/types/index.ts

export type ViewName = 
  | 'catalog' 
  | 'booking' 
  | 'admin-login' 
  | 'admin-dashboard' 
  | 'student-login' 
  | 'student-dashboard'
  | 'client-login'      // ✅ NEW: Public client login
  | 'client-dashboard'; // ✅ NEW: Client profile & bookings

export interface User {
  uid: string;
  role: 'admin' | 'student';
  name: string;
  username: string;
  email?: string;
  password?: string;
  isTemp?: boolean;
  services_active?: string[];
}

// ✅ NEW: Client Interface for Public Members
export interface Client {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string; // Date of Birth (YYYY-MM-DD)
  address?: string;
  occupation?: string;
  
  // Static Profile Data (Filled once during registration/profile update)
  medical_history?: {
    conditions: string[]; // e.g., ['Acne', 'Eczema', 'Allergies']
    details?: string;
    medications?: string;
    accutane?: boolean;
    radiation_chemo?: boolean;
    recent_surgery?: boolean;
    pregnancy?: boolean;
    contact_lenses?: boolean;
  };
  lifestyle?: {
    smokes?: boolean;
    exercises?: boolean;
    restricted_diet?: boolean;
    diet_details?: string;
    water_intake?: string;
    caffeine_intake?: string;
    alcohol_intake?: string;
    stress_level?: string;
  };
  skin_care_regime?: {
    products: string[];
    active_ingredients: string[];
    sunscreen?: boolean;
    prescription_skincare?: boolean;
    injectables_3mo?: boolean;
    peels_1mo?: boolean;
  };
  hair_concerns?: string[];
  hair_chemical_history?: string;
  hair_care_regime?: string;
}

export interface Service {
  service_id: string;
  category: string;
  name: string;
  price: number;
  duration?: number;
}

export interface ScheduleEntry {
  student_id: string;
  date: string;
  time: string;
  is_open: boolean;
}

// ✅ UPDATED: Booking now links to a Client
export interface Booking {
  id: number | string;
  service: Service;
  student: string; // student name (legacy)
  student_id: string;
  client_id?: string; // ✅ NEW: Link to Client UID (if logged in)
  client_name: string;
  client_email: string;
  client_phone?: string;
  date: string;
  time: string;
  status?: 'confirmed' | 'cancelled_by_student' | 'completed';
}

// ✅ NEW: Form Structures for the 5-Category System
export type FieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'signature' | 'date' | 'number';

export interface FormField {
  field_id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[]; // For select/radio
}

export interface Form {
  form_id: string;
  service_id: string; // Which service triggers this form
  title: string;
  description: string;
  is_required: boolean;
  created_at: string;
  
  // ✅ Categorized Fields
  client_static_fields?: FormField[];      // Saved to Client Profile (One-off)
  client_session_fields?: FormField[];     // Filled at Booking (Per-session, includes Signature)
  therapist_pre_fields?: FormField[];      // Filled by Student Pre-Service
  therapist_post_fields?: FormField[];     // Filled by Student Post-Service
  assessor_fields?: FormField[];           // Filled by Teacher/Assessor
}

export interface FormResponse {
  field_id: string;
  value: any;
}

export interface FormSubmission {
  id?: string;
  form_id: string;
  booking_id?: string;
  client_id?: string;
  student_id?: string;
  
  // ✅ Responses separated by role
  client_responses?: FormResponse[];
  therapist_pre_responses?: FormResponse[];
  therapist_post_responses?: FormResponse[];
  assessor_responses?: FormResponse[];
  
  submitted_at: string;
  is_signed?: boolean;
}