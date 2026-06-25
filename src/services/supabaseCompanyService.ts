import { supabase } from '../lib/supabase';
import { Company } from '../types/company';

export const supabaseCompanyService = {
  async getCompanies(): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return (data || []) as Company[];
  },

  async addCompany(companyData: Omit<Company, 'id'>): Promise<Company> {
    const slug = companyData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const id = `company_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const { data, error } = await supabase
      .from('companies')
      .insert([{
        id,
        name: companyData.name,
        slug,
        status: companyData.status || 'Ativo',
        email: companyData.email || null,
        phone: companyData.phone || null,
        cnpj: companyData.cnpj || null
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Company;
  },

  async updateCompany(id: string, fields: Partial<Company>): Promise<Company> {
    const updatePayload: any = { ...fields };
    if (fields.name) {
      updatePayload.slug = fields.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }
    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('companies')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Company;
  },

  async deleteCompany(id: string): Promise<void> {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
