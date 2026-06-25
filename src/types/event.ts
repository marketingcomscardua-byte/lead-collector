export interface Event {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  state: string;
  stateUf?: string;
  city: string;
  cityId?: number | null;
  location: string;
  status: 'active' | 'future' | 'completed';
  description?: string;
  notes?: string;
  productIds: string[]; // Linked product IDs
  sellerIds: string[]; // Linked seller IDs
}

