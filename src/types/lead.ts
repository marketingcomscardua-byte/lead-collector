export type LeadStatus = 'Novo' | 'Em Atendimento' | 'Interessado' | 'Sem Retorno' | 'Convertido' | 'Perdido';

export interface Lead {
  id: string;
  createdAt: string;
  updatedAt: string;
  eventId: string;
  eventName: string;
  sellerId: string;
  sellerName: string;
  companyId?: string;
  companyName?: string;
  fullName: string;
  phone: string;
  state: string;
  stateUf?: string;
  city: string;
  cityId?: number | null;
  products: string[]; // List of selected product names
  status: LeadStatus;
  origin: string; // 'evento/app'
}


