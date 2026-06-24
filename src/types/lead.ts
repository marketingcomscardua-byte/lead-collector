export type LeadStatus = 'novo' | 'em_atendimento' | 'interessado' | 'sem_retorno' | 'convertido' | 'perdido';

export interface Lead {
  id: string;
  createdAt: string;
  updatedAt: string;
  eventId: string;
  name: string;
  phone: string;
  state: string;
  city: string;
  sellerId: string;
  productIds: string[];
  notes?: string;
  status: LeadStatus;
  source: string; // e.g., 'event/app'
}
