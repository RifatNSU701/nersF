export type UserRole =
  | 'VISITOR'
  | 'TENDER_USER'
  | 'CITIZEN'
  | 'VENDOR'
  | 'AUDITOR'
  | 'ADMIN'
  | 'SUPER_ADMIN'
  | 'OFFICER'
  | 'TENDER_OFFICER'
  | 'SUPPORT_AGENT'
  | 'HELP_DESK';

export interface User {
  id?: string;
  full_name: string;
  email: string;
  password_hash: string;
  role?: UserRole;
  phone_number?: string;
  created_at?: Date;
}
