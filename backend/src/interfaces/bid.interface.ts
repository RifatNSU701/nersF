import { RowDataPacket } from 'mysql2';

export enum BidStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface Bid {
  id?: string;
  tender_id: string;
  vendor_id: string;
  bid_amount: number;
  proposal_text: string;
  status: BidStatus;
  submitted_at?: Date;
}

// Helper for SQL results
export interface BidRow extends RowDataPacket, Bid {}