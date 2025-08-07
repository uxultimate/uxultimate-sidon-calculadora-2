
export interface Quote {
  id: string;
  quoteNumber?: string;
  contactName: string;
  contactCompanyName?: string;
  contactCif?: string;
  contactEmail: string;
  contactAddress?: string;
  lineItems: Omit<LineItem, 'id'>[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  createdAt: Date;
  sentAt?: Date;
}


export interface LineItem {
  id: number;
  name: string;
  details: string;
  quantity: number;
  price: number;
  total: number;
}

export interface CompanyProfile {
    name?: string;
    cif?: string;
    address?: string;
    phone?: string;
    email?: string;
    logoUrl?: string;
}
