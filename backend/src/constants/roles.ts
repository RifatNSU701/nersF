// Roles must match the values stored in the MySQL users table.
export enum UserRoles {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  OFFICER = 'OFFICER',
  TENDER_OFFICER = 'TENDER_OFFICER',
  AUDITOR = 'AUDITOR',
  VENDOR = 'VENDOR',
  CITIZEN = 'CITIZEN',
  VISITOR = 'VISITOR',
  SUPPORT_AGENT = 'SUPPORT_AGENT'
}

export type UserRole = keyof typeof UserRoles;