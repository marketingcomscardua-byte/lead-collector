import { supabase } from '../lib/supabase';
import { Lead } from '../types/lead';

export const supabaseLeadService = {
  async getLeads(): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.id,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      eventId: item.event_id,
      eventName: item.event_name,
      sellerId: item.seller_id,
      sellerName: item.seller_name,
      companyId: item.company_id,
      companyName: item.company_name,
      fullName: item.customer_name,
      phone: item.customer_phone,
      state: item.state,
      stateUf: item.state_uf,
      city: item.city,
      cityId: item.city_id,
      products: item.products_of_interest || [],
      status: item.status,
      origin: item.origin
    })) as Lead[];
  },

  async addLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'origin'>): Promise<Lead> {
    const id = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const { data, error } = await supabase
      .from('leads')
      .insert([{
        id,
        event_id: leadData.eventId,
        event_name: leadData.eventName,
        seller_id: leadData.sellerId,
        seller_name: leadData.sellerName,
        company_id: leadData.companyId || null,
        company_name: leadData.companyName || null,
        customer_name: leadData.fullName,
        customer_phone: leadData.phone,
        state: leadData.state,
        state_uf: leadData.stateUf || null,
        city: leadData.city,
        city_id: leadData.cityId || null,
        products_of_interest: leadData.products,
        status: 'Novo',
        origin: 'evento/app'
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      eventId: data.event_id,
      eventName: data.event_name,
      sellerId: data.seller_id,
      sellerName: data.seller_name,
      companyId: data.company_id,
      companyName: data.company_name,
      fullName: data.customer_name,
      phone: data.customer_phone,
      state: data.state,
      stateUf: data.state_uf,
      city: data.city,
      cityId: data.city_id,
      products: data.products_of_interest || [],
      status: data.status,
      origin: data.origin
    } as Lead;
  },

  async deleteLead(id: string): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
