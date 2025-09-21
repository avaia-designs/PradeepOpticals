export interface QuotationItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications: {
    material?: string;
    color?: string;
    size?: string;
    lensType?: string;
    prescription?: string;
  };
}

export interface StaffReply {
  message: string;
  staffId: string;
  repliedAt: string;
}

export interface Quotation {
  _id: string;
  quotationNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: QuotationItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  status: QuotationStatus;
  notes?: string;
  prescriptionFile?: string;
  validUntil: string;
  
  // Staff fields
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectedReason?: string;
  staffNotes?: string;
  
  // Customer approval fields
  customerApprovedAt?: string;
  customerRejectedAt?: string;
  customerRejectionReason?: string;
  
  // Communication
  staffReplies?: StaffReply[];
  
  // Order conversion
  convertedAt?: string;
  convertedToOrder?: string;
  
  // Timestamps
  createdAt: string;
  modifiedAt: string;
}

export enum QuotationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CONVERTED = 'converted',
  EXPIRED = 'expired'
}

export interface CreateQuotationRequest {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: Array<{
    productId: string;
    quantity: number;
    specifications?: Record<string, any>;
  }>;
  notes?: string;
  prescriptionFile?: string;
}

export interface QuotationFilters {
  page?: number;
  limit?: number;
  status?: QuotationStatus;
  search?: string;
}

export interface QuotationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  converted: number;
  expired: number;
}

export interface QuotationResponse {
  success: boolean;
  data: Quotation | Quotation[];
  message: string;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ApproveQuotationRequest {
  staffNotes?: string;
}

export interface RejectQuotationRequest {
  reason: string;
  staffNotes?: string;
}

export interface CustomerRejectQuotationRequest {
  reason: string;
}

export interface StaffReplyRequest {
  message: string;
}
