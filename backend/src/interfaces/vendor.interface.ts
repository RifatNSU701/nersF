export interface VendorProfile {
  id?: string;               // UUID (Optional because we generate it)
  user_id: string;           // Links to the User Account
  company_name: string;      // Legal Name
  trade_license_no: string;  // The License Number
  tax_id_no: string;         // TIN / VAT
  address_line: string;      // Physical HQ
  city: string;
  compliance_status?: 'VERIFIED' | 'PENDING' | 'REJECTED' | 'BLACKLISTED';
  rating?: number;           // 0.00 to 5.00
  created_at?: Date;
}