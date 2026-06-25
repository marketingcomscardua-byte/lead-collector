export interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cnpj?: string;
  status: 'Ativo' | 'Inativo';
}
