export interface User {
  id?: string; // Optional because we create it inside the Model
  full_name: string;
  email: string;
  password_hash: string;
  role?: UserRole;
  phone_number?: string;
  created_at?: Date;
}

// Strict Role Enforcement
export type UserRole = 'VISITOR' | 'TENDER_USER' | 'AUDITOR' | 'ADMIN' | 'HELP_DESK';