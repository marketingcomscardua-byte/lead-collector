import { supabase } from '../lib/supabase';
import { Seller } from '../types/seller';

export const supabaseProfileService = {
  async getSellers(): Promise<Seller[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, companies(name)')
      .order('name', { ascending: true });

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      phone: item.phone,
      email: item.email,
      username: item.username,
      password: item.password,
      role: item.role,
      isProtected: item.is_protected,
      companyId: item.company_id,
      companyName: item.companies?.name || 'Sem Empresa',
      status: item.status,
      avatar: item.avatar
    })) as Seller[];
  },

  async addSeller(sellerData: Omit<Seller, 'id'>): Promise<Seller> {
    const id = `seller_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id,
        name: sellerData.name,
        phone: sellerData.phone,
        email: sellerData.email,
        username: sellerData.username,
        password: sellerData.password,
        role: sellerData.role,
        company_id: sellerData.companyId || null,
        status: sellerData.status || 'Ativo',
        is_protected: sellerData.isProtected || false,
        avatar: sellerData.avatar || null
      }])
      .select('*, companies(name)')
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      username: data.username,
      password: data.password,
      role: data.role,
      isProtected: data.is_protected,
      companyId: data.company_id,
      companyName: data.companies?.name || 'Sem Empresa',
      status: data.status,
      avatar: data.avatar
    } as Seller;
  },

  async updateSeller(id: string, fields: Partial<Seller>): Promise<Seller> {
    const updatePayload: any = {};
    if (fields.name !== undefined) updatePayload.name = fields.name;
    if (fields.phone !== undefined) updatePayload.phone = fields.phone;
    if (fields.email !== undefined) updatePayload.email = fields.email;
    if (fields.username !== undefined) updatePayload.username = fields.username;
    if (fields.password !== undefined) updatePayload.password = fields.password;
    if (fields.role !== undefined) updatePayload.role = fields.role;
    if (fields.companyId !== undefined) updatePayload.company_id = fields.companyId || null;
    if (fields.status !== undefined) updatePayload.status = fields.status;
    if (fields.avatar !== undefined) updatePayload.avatar = fields.avatar;
    if (fields.isProtected !== undefined) updatePayload.is_protected = fields.isProtected;
    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', id)
      .select('*, companies(name)')
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      username: data.username,
      password: data.password,
      role: data.role,
      isProtected: data.is_protected,
      companyId: data.company_id,
      companyName: data.companies?.name || 'Sem Empresa',
      status: data.status,
      avatar: data.avatar
    } as Seller;
  },

  async deleteSeller(id: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
