// Define the Roles available in the system
// These MUST match the ENUM values in your MySQL 'users' table
export enum UserRoles {
  ADMIN = 'ADMIN',
  TENDER_OFFICER = 'TENDER_OFFICER',
  AUDITOR = 'AUDITOR',
  VENDOR = 'VENDOR',
  VISITOR = 'VISITOR',
  SUPPORT_AGENT = 'SUPPORT_AGENT'
}

// Create a Type alias so we can use 'UserRole' in our interfaces
export type UserRole = keyof typeof UserRoles;