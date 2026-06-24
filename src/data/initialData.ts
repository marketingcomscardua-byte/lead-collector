import { Event } from '../types/event';
import { Seller } from '../types/seller';
import { Product } from '../types/product';
import { Lead } from '../types/lead';

export const INITIAL_BRANDS = [
  'Agritech',
  'Sunward',
  'Moldemaq',
  'Comercial Scardua'
];

export const INITIAL_CATEGORIES = [
  'Trator',
  'Transportador Agrícola',
  'Escavadeira',
  'Mini Escavadeira',
  'Pá Carregadeira',
  'Peças',
  'Serviço',
  'Outros'
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Trator Agritech 1155',
    brand: 'Agritech',
    category: 'Trator',
    isActive: true
  },
  {
    id: 'p2',
    name: 'Mini Escavadeira Sunward SWE20F',
    brand: 'Sunward',
    category: 'Mini Escavadeira',
    isActive: true
  },
  {
    id: 'p3',
    name: 'Transportador Agrícola Moldemaq 1500',
    brand: 'Moldemaq',
    category: 'Transportador Agrícola',
    isActive: true
  },
  {
    id: 'p4',
    name: 'Pá Carregadeira Sunward SL30W',
    brand: 'Sunward',
    category: 'Pá Carregadeira',
    isActive: true
  },
  {
    id: 'p5',
    name: 'Serviço de Manutenção Preventiva',
    brand: 'Comercial Scardua',
    category: 'Serviço',
    isActive: true
  },
  {
    id: 'p6',
    name: 'Peças Originais Agritech',
    brand: 'Agritech',
    category: 'Peças',
    isActive: true
  }
];

export const INITIAL_SELLERS: Seller[] = [
  {
    id: 'v1',
    name: 'Mateus Hungaro',
    phone: '(27) 99999-1111',
    email: 'mateus.hungaro@comercialscardua.com.br',
    isActive: true
  },
  {
    id: 'v2',
    name: 'João Silva',
    phone: '(27) 99999-2222',
    email: 'joao.silva@comercialscardua.com.br',
    isActive: true
  },
  {
    id: 'v3',
    name: 'Maria Santos',
    phone: '(27) 99999-3333',
    email: 'maria.santos@comercialscardua.com.br',
    isActive: true
  }
];

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'e1',
    name: 'Feira Agrícola do Estado 2026',
    location: 'Vila Velha - ES',
    startDate: '2026-06-24',
    endDate: '2026-06-28',
    status: 'active',
    notes: 'Principal feira do setor no primeiro semestre.'
  },
  {
    id: 'e2',
    name: 'Demonstração de Tratores Scardua',
    location: 'Cariacica - ES',
    startDate: '2026-07-15',
    endDate: '2026-07-17',
    status: 'future',
    notes: 'Demonstração prática de escavadeiras e tratores para clientes selecionados.'
  },
  {
    id: 'e3',
    name: 'ExpoAgro Norte 2026',
    location: 'Linhares - ES',
    startDate: '2026-05-10',
    endDate: '2026-05-14',
    status: 'completed',
    notes: 'Feira finalizada com excelentes resultados.'
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'l1',
    createdAt: '2026-06-24T10:30:00.000Z',
    updatedAt: '2026-06-24T10:30:00.000Z',
    eventId: 'e1',
    name: 'Carlos Oliveira da Silva',
    phone: '(27) 98888-7777',
    state: 'ES',
    city: 'Vila Velha',
    sellerId: 'v1',
    productIds: ['p1', 'p3'],
    notes: 'Interessado em fechar negócio até o final do evento.',
    status: 'interessado',
    source: 'event/app'
  },
  {
    id: 'l2',
    createdAt: '2026-06-24T11:15:00.000Z',
    updatedAt: '2026-06-24T11:15:00.000Z',
    eventId: 'e1',
    name: 'Aline Souza Pires',
    phone: '(27) 97777-6666',
    state: 'ES',
    city: 'Serra',
    sellerId: 'v2',
    productIds: ['p2'],
    notes: 'Solicitou orçamento formal de Mini Escavadeira por e-mail.',
    status: 'novo',
    source: 'event/app'
  }
];
