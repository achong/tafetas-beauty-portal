export interface User {
  uid: string;
  role: 'admin' | 'student';
  name: string;
  username: string;
  password: string;
  isTemp: boolean;
  services_active?: string[];
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
