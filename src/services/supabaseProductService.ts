import { supabase } from '../lib/supabase';
import { Product } from '../types/product';

const VALID_CATEGORIES = [
  "Trator",
  "Microtrator",
  "Transportador Agrícola",
  "Escavadeira",
  "Mini Escavadeira",
  "Pá Carregadeira",
  "Empilhadeira",
  "Transpaleteira",
  "Peças",
  "Serviço",
  "Outros"
];

function normalizeCategory(cat?: string): string {
  if (!cat) return 'Outros';
  if (VALID_CATEGORIES.includes(cat)) return cat;
  return 'Outros';
}

export const supabaseProductService = {
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, companies(name)')
      .order('name', { ascending: true });

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      brand: item.brand,
      category: normalizeCategory(item.category),
      line: item.line,
      companyId: item.company_id,
      companyName: item.companies?.name || item.company_name || 'Sem Empresa',
      status: item.status
    })) as Product[];
  },

  async addProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    const id = `product_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const { data, error } = await supabase
      .from('products')
      .insert([{
        id,
        name: productData.name,
        brand: productData.brand || null,
        category: normalizeCategory(productData.category),
        line: productData.line || null,
        company_id: productData.companyId || null,
        company_name: productData.companyName || null,
        status: productData.status || 'Ativo'
      }])
      .select('*, companies(name)')
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      brand: data.brand,
      category: data.category,
      line: data.line,
      companyId: data.company_id,
      companyName: data.companies?.name || data.company_name || 'Sem Empresa',
      status: data.status
    } as Product;
  },

  async updateProduct(id: string, fields: Partial<Product>): Promise<Product> {
    const updatePayload: any = {};
    if (fields.name !== undefined) updatePayload.name = fields.name;
    if (fields.brand !== undefined) updatePayload.brand = fields.brand;
    if (fields.category !== undefined) updatePayload.category = normalizeCategory(fields.category);
    if (fields.line !== undefined) updatePayload.line = fields.line;
    if (fields.companyId !== undefined) updatePayload.company_id = fields.companyId || null;
    if (fields.companyName !== undefined) updatePayload.company_name = fields.companyName || null;
    if (fields.status !== undefined) updatePayload.status = fields.status;
    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select('*, companies(name)')
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      brand: data.brand,
      category: data.category,
      line: data.line,
      companyId: data.company_id,
      companyName: data.companies?.name || data.company_name || 'Sem Empresa',
      status: data.status
    } as Product;
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
