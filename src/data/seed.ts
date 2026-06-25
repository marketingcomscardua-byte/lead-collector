import { Seller } from '../types/seller';
import { Event } from '../types/event';
import { Company } from '../types/company';
import { Product } from '../types/product';

export const SEED_COMPANIES: Company[] = [
  { id: 'c1', name: 'TRAÇÃOFORT MAQUINAS E EQUIPAMENTOS LTDA', status: 'Ativo' },
  { id: 'c2', name: 'PORTO LIVRE', status: 'Ativo' },
  { id: 'c3', name: 'MARINE CENTER', status: 'Ativo' },
  { id: 'c4', name: 'C. SCARDUA LTDA - PA', status: 'Ativo' },
  { id: 'c5', name: 'C. SCARDUA LTDA - M.G', status: 'Ativo' },
  { id: 'c6', name: 'C. SCARDUA LTDA - LINHARES', status: 'Ativo' },
  { id: 'c7', name: 'C. SCARDUA LTDA - ITARANA', status: 'Ativo' },
  { id: 'c8', name: 'C. SCARDUA LTDA - CARAPINA', status: 'Ativo' }
];

export const SEED_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Agritech', companyId: 'c8', companyName: 'C. SCARDUA LTDA - CARAPINA', status: 'Ativo' },
  { id: 'p2', name: 'Agritech', companyId: 'c6', companyName: 'C. SCARDUA LTDA - LINHARES', status: 'Ativo' },
  { id: 'p3', name: 'Sunward', companyId: 'c2', companyName: 'PORTO LIVRE', status: 'Ativo' },
  { id: 'p4', name: 'YTO ESK305', companyId: 'c2', companyName: 'PORTO LIVRE', status: 'Ativo' }
];

export const ROOT_ADMIN_SEED: Seller = {
  id: 'root-admin',
  name: 'Administrador',
  username: 'admin',
  email: 'admin@scardua.com.br',
  password: '1234',
  phone: '27999990000',
  role: 'root_admin',
  companyId: null,
  companyName: 'Todas',
  isProtected: true,
  status: 'Ativo'
};

export const SEED_SELLERS: Seller[] = [
  ROOT_ADMIN_SEED,
  {
    id: 's_test1',
    name: 'teste1',
    phone: '27995293341',
    email: 'teste@123.com.br',
    username: 'teste1',
    password: '123456',
    role: 'vendor',
    companyId: 'c8',
    companyName: 'C. SCARDUA LTDA - CARAPINA',
    status: 'Ativo'
  },
  {
    id: 's_ramiro',
    name: 'Ramiro',
    phone: '27999998888',
    email: 'ramiro@scardua.com.br',
    username: 'ramiro',
    password: '123',
    role: 'vendor',
    companyId: 'c2',
    companyName: 'PORTO LIVRE',
    status: 'Ativo'
  }
];

export const SEED_EVENTS: Event[] = [
  {
    id: 'e_teixeira',
    name: 'Loja Teixeira',
    startDate: '2026-06-24',
    endDate: '2026-06-25',
    state: 'Bahia',
    stateUf: 'BA',
    city: 'Teixeira de Freitas',
    cityId: 2931350,
    location: 'Centro - Teixeira de Freitas',
    status: 'active',
    description: 'Evento inicial na Bahia.',
    productIds: ['p4'], // YTO ESK305
    sellerIds: ['s_ramiro', 's_test1'] // Ramiro and teste1 linked
  }
];
