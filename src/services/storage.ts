import { Lead } from '../types/lead';
import { Event } from '../types/event';
import { Seller } from '../types/seller';
import { Product } from '../types/product';
import {
  INITIAL_EVENTS,
  INITIAL_SELLERS,
  INITIAL_PRODUCTS,
  INITIAL_LEADS
} from '../data/initialData';

const KEYS = {
  LEADS: 'lead_collector_leads',
  EVENTS: 'lead_collector_events',
  SELLERS: 'lead_collector_sellers',
  PRODUCTS: 'lead_collector_products',
  ACTIVE_EVENT: 'lead_collector_active_event_id',
  ACTIVE_SELLER: 'lead_collector_active_seller_id',
};

export const storageService = {
  init() {
    if (!localStorage.getItem(KEYS.EVENTS)) {
      localStorage.setItem(KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
    }
    if (!localStorage.getItem(KEYS.SELLERS)) {
      localStorage.setItem(KEYS.SELLERS, JSON.stringify(INITIAL_SELLERS));
    }
    if (!localStorage.getItem(KEYS.PRODUCTS)) {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem(KEYS.LEADS)) {
      localStorage.setItem(KEYS.LEADS, JSON.stringify(INITIAL_LEADS));
    }
    if (!localStorage.getItem(KEYS.ACTIVE_EVENT) && INITIAL_EVENTS.length > 0) {
      const activeEvent = INITIAL_EVENTS.find(e => e.status === 'active');
      if (activeEvent) {
        localStorage.setItem(KEYS.ACTIVE_EVENT, activeEvent.id);
      }
    }
    if (!localStorage.getItem(KEYS.ACTIVE_SELLER) && INITIAL_SELLERS.length > 0) {
      localStorage.setItem(KEYS.ACTIVE_SELLER, INITIAL_SELLERS[0].id);
    }
  },

  // LEADS
  getLeads(): Lead[] {
    const data = localStorage.getItem(KEYS.LEADS);
    return data ? JSON.parse(data) : [];
  },

  saveLeads(leads: Lead[]): void {
    localStorage.setItem(KEYS.LEADS, JSON.stringify(leads));
  },

  addLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Lead {
    const leads = this.getLeads();
    const newLead: Lead = {
      ...lead,
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    leads.unshift(newLead); // Add to the beginning of the list
    this.saveLeads(leads);
    return newLead;
  },

  updateLead(id: string, updatedFields: Partial<Lead>): Lead {
    const leads = this.getLeads();
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Lead não encontrado');
    
    const updatedLead: Lead = {
      ...leads[index],
      ...updatedFields,
      updatedAt: new Date().toISOString()
    };
    
    leads[index] = updatedLead;
    this.saveLeads(leads);
    return updatedLead;
  },

  // EVENTS
  getEvents(): Event[] {
    const data = localStorage.getItem(KEYS.EVENTS);
    return data ? JSON.parse(data) : [];
  },

  saveEvents(events: Event[]): void {
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
  },

  addEvent(event: Omit<Event, 'id'>): Event {
    const events = this.getEvents();
    const newEvent: Event = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
    events.push(newEvent);
    this.saveEvents(events);
    return newEvent;
  },

  updateEvent(id: string, updatedFields: Partial<Event>): Event {
    const events = this.getEvents();
    const index = events.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Evento não encontrado');

    const updatedEvent: Event = {
      ...events[index],
      ...updatedFields
    };

    events[index] = updatedEvent;
    this.saveEvents(events);
    return updatedEvent;
  },

  // SELLERS
  getSellers(): Seller[] {
    const data = localStorage.getItem(KEYS.SELLERS);
    return data ? JSON.parse(data) : [];
  },

  saveSellers(sellers: Seller[]): void {
    localStorage.setItem(KEYS.SELLERS, JSON.stringify(sellers));
  },

  addSeller(seller: Omit<Seller, 'id'>): Seller {
    const sellers = this.getSellers();
    const newSeller: Seller = {
      ...seller,
      id: `seller_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
    sellers.push(newSeller);
    this.saveSellers(sellers);
    return newSeller;
  },

  updateSeller(id: string, updatedFields: Partial<Seller>): Seller {
    const sellers = this.getSellers();
    const index = sellers.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Vendedor não encontrado');

    const updatedSeller: Seller = {
      ...sellers[index],
      ...updatedFields
    };

    sellers[index] = updatedSeller;
    this.saveSellers(sellers);
    return updatedSeller;
  },

  // PRODUCTS
  getProducts(): Product[] {
    const data = localStorage.getItem(KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  },

  saveProducts(products: Product[]): void {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  addProduct(product: Omit<Product, 'id'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...product,
      id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
    products.push(newProduct);
    this.saveProducts(products);
    return newProduct;
  },

  updateProduct(id: string, updatedFields: Partial<Product>): Product {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Produto não encontrado');

    const updatedProduct: Product = {
      ...products[index],
      ...updatedFields
    };

    products[index] = updatedProduct;
    this.saveProducts(products);
    return updatedProduct;
  },

  // ACTIVE CONFIGS
  getActiveEventId(): string {
    return localStorage.getItem(KEYS.ACTIVE_EVENT) || '';
  },

  setActiveEventId(id: string): void {
    localStorage.setItem(KEYS.ACTIVE_EVENT, id);
  },

  getActiveSellerId(): string {
    return localStorage.getItem(KEYS.ACTIVE_SELLER) || '';
  },

  setActiveSellerId(id: string): void {
    localStorage.setItem(KEYS.ACTIVE_SELLER, id);
  }
};
