import { RowDataPacket } from 'mysql2';

export enum TenderStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  AWARDED = 'AWARDED',
  CANCELLED = 'CANCELLED'
}

export interface Tender {
  id?: string;
  reference_no: string;      // Unique Gov ID (e.g., "GOV-2026-001")
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  opening_date: Date;
  closing_date: Date;
  status: TenderStatus;
  created_by: string;        // User ID of the Admin
  created_at?: Date;
}

// Helper for SQL results
export interface TenderRow extends RowDataPacket, Tender {}