export interface Product {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  /** Linha do produto: "Linha Agrícola" | "Linha Amarela" */
  line?: string;
  companyId?: string;
  companyName?: string;
  status: 'Ativo' | 'Inativo';
}

