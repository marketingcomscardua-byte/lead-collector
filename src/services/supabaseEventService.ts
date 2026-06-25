import { supabase } from '../lib/supabase';
import { Event } from '../types/event';

export const supabaseEventService = {
  async getEvents(): Promise<Event[]> {
    const { data: events, error: eventError } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (eventError) throw eventError;

    const { data: evProducts, error: epError } = await supabase
      .from('event_products')
      .select('event_id, product_id');

    if (epError) throw epError;

    const { data: evSellers, error: esError } = await supabase
      .from('event_sellers')
      .select('event_id, seller_id');

    if (esError) throw esError;

    const productMap = (evProducts || []).reduce((acc: Record<string, string[]>, ep: any) => {
      if (!acc[ep.event_id]) acc[ep.event_id] = [];
      acc[ep.event_id].push(ep.product_id);
      return acc;
    }, {} as Record<string, string[]>);

    const sellerMap = (evSellers || []).reduce((acc: Record<string, string[]>, es: any) => {
      if (!acc[es.event_id]) acc[es.event_id] = [];
      acc[es.event_id].push(es.seller_id);
      return acc;
    }, {} as Record<string, string[]>);

    return (events || []).map((ev: any) => ({
      id: ev.id,
      name: ev.name,
      startDate: ev.start_date,
      endDate: ev.end_date,
      state: ev.state,
      stateUf: ev.state_uf,
      city: ev.city,
      cityId: ev.city_id,
      location: ev.location,
      status: ev.status,
      description: ev.description,
      notes: ev.notes,
      productIds: productMap[ev.id] || [],
      sellerIds: sellerMap[ev.id] || []
    })) as Event[];
  },

  async addEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
    const id = `event_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const { error: eventError } = await supabase
      .from('events')
      .insert([{
        id,
        name: eventData.name,
        start_date: eventData.startDate,
        end_date: eventData.endDate,
        state: eventData.state,
        state_uf: eventData.stateUf || null,
        city: eventData.city,
        city_id: eventData.cityId || null,
        location: eventData.location,
        status: eventData.status || 'active',
        description: eventData.description || null,
        notes: eventData.notes || null
      }]);

    if (eventError) throw eventError;

    // Link products
    if (eventData.productIds && eventData.productIds.length > 0) {
      const epPayload = eventData.productIds.map(pid => ({
        event_id: id,
        product_id: pid
      }));
      const { error: epError } = await supabase.from('event_products').insert(epPayload);
      if (epError) throw epError;
    }

    // Link sellers
    if (eventData.sellerIds && eventData.sellerIds.length > 0) {
      const esPayload = eventData.sellerIds.map(sid => ({
        event_id: id,
        seller_id: sid
      }));
      const { error: esError } = await supabase.from('event_sellers').insert(esPayload);
      if (esError) throw esError;
    }

    return {
      ...eventData,
      id
    } as Event;
  },

  async updateEvent(id: string, fields: Partial<Event>): Promise<Event> {
    const updatePayload: any = {};
    if (fields.name !== undefined) updatePayload.name = fields.name;
    if (fields.startDate !== undefined) updatePayload.start_date = fields.startDate;
    if (fields.endDate !== undefined) updatePayload.end_date = fields.endDate;
    if (fields.state !== undefined) updatePayload.state = fields.state;
    if (fields.stateUf !== undefined) updatePayload.state_uf = fields.stateUf || null;
    if (fields.city !== undefined) updatePayload.city = fields.city;
    if (fields.cityId !== undefined) updatePayload.city_id = fields.cityId || null;
    if (fields.location !== undefined) updatePayload.location = fields.location;
    if (fields.status !== undefined) updatePayload.status = fields.status;
    if (fields.description !== undefined) updatePayload.description = fields.description || null;
    if (fields.notes !== undefined) updatePayload.notes = fields.notes || null;
    updatePayload.updated_at = new Date().toISOString();

    const { error: eventError } = await supabase
      .from('events')
      .update(updatePayload)
      .eq('id', id);

    if (eventError) throw eventError;

    // Sync products if provided
    if (fields.productIds !== undefined) {
      // Clear old
      await supabase.from('event_products').delete().eq('event_id', id);
      // Insert new
      if (fields.productIds.length > 0) {
        const epPayload = fields.productIds.map(pid => ({
          event_id: id,
          product_id: pid
        }));
        const { error: epError } = await supabase.from('event_products').insert(epPayload);
        if (epError) throw epError;
      }
    }

    // Sync sellers if provided
    if (fields.sellerIds !== undefined) {
      // Clear old
      await supabase.from('event_sellers').delete().eq('event_id', id);
      // Insert new
      if (fields.sellerIds.length > 0) {
        const esPayload = fields.sellerIds.map(sid => ({
          event_id: id,
          seller_id: sid
        }));
        const { error: esError } = await supabase.from('event_sellers').insert(esPayload);
        if (esError) throw esError;
      }
    }

    // Load updated event
    const events = await this.getEvents();
    const updated = events.find(e => e.id === id);
    if (!updated) throw new Error("Evento não encontrado após atualização");
    return updated;
  },

  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
