import { Lead } from '../types/lead';
import { Event } from '../types/event';
import { Seller, isRootAdminUser } from '../types/seller';
import { Company } from '../types/company';
import { Product } from '../types/product';
import { SEED_SELLERS, SEED_EVENTS, SEED_PRODUCTS, SEED_COMPANIES, ROOT_ADMIN_SEED } from '../data/seed';

const KEYS = {
  LEADS: 'lead_collector_v3_leads',
  EVENTS: 'lead_collector_v3_events',
  SELLERS: 'lead_collector_v3_sellers',
  PRODUCTS: 'lead_collector_v3_products',
  COMPANIES: 'lead_collector_v3_companies',
  CURRENT_SELLER_ID: 'lead_collector_v3_current_seller_id',
};

export const leadCollectorStorage = {
  /**
   * Initialize storage with seed data if not present.
   * Also runs migration to ensure root admin has correct properties.
   */
  init() {
    if (!localStorage.getItem(KEYS.COMPANIES)) {
      localStorage.setItem(KEYS.COMPANIES, JSON.stringify(SEED_COMPANIES));
    }

    // Handle sellers initialization with migration
    const rawSellers = localStorage.getItem(KEYS.SELLERS);
    if (!rawSellers) {
      // Fresh install: use seed sellers
      localStorage.setItem(KEYS.SELLERS, JSON.stringify(SEED_SELLERS));
    } else {
      // Existing data: run migration for root admin protection
      this._migrateRootAdmin();
    }

    if (!localStorage.getItem(KEYS.PRODUCTS)) {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
    }
    if (!localStorage.getItem(KEYS.EVENTS)) {
      localStorage.setItem(KEYS.EVENTS, JSON.stringify(SEED_EVENTS));
    }
    if (!localStorage.getItem(KEYS.LEADS)) {
      localStorage.setItem(KEYS.LEADS, JSON.stringify([]));
    }
  },

  /**
   * Migration: ensure root admin always has correct protected properties.
   * Handles old data where admin might have role='Admin', id='s_admin', etc.
   */
  _migrateRootAdmin() {
    const sellers = this.getSellers();

    // Find any existing admin@scardua.com.br entry (old or new)
    const existingAdminIdx = sellers.findIndex(
      s => s.email === 'admin@scardua.com.br' || s.id === 's_admin' || s.id === 'root-admin'
    );

    if (existingAdminIdx === -1) {
      // No root admin found at all — inject the seed
      sellers.unshift(ROOT_ADMIN_SEED);
      this.saveSellers(sellers);
      return;
    }

    const existing = sellers[existingAdminIdx];

    // Merge: keep the current password but enforce all other protected fields
    const migrated: Seller = {
      ...existing,
      id: 'root-admin',                    // Normalize id
      name: 'Administrador',               // Lock name
      username: 'admin',                   // Lock username (login by email)
      email: 'admin@scardua.com.br',       // Lock email
      phone: existing.phone || '27999990000',
      role: 'root_admin',                  // Force correct role
      companyId: null,                     // No company scope
      companyName: 'Todas',                // All companies
      isProtected: true,                   // Protection flag
      status: 'Ativo',                     // Always active
      password: existing.password || ROOT_ADMIN_SEED.password, // Keep current password
    };

    sellers[existingAdminIdx] = migrated;
    this.saveSellers(sellers);

    // If current session is pointing to old id 's_admin', update to 'root-admin'
    const currentId = localStorage.getItem(KEYS.CURRENT_SELLER_ID);
    if (currentId === 's_admin') {
      localStorage.setItem(KEYS.CURRENT_SELLER_ID, 'root-admin');
    }
  },

  // COMPANIES
  getCompanies(): Company[] {
    const data = localStorage.getItem(KEYS.COMPANIES);
    return data ? JSON.parse(data) : [];
  },

  saveCompanies(companies: Company[]): void {
    localStorage.setItem(KEYS.COMPANIES, JSON.stringify(companies));
  },

  addCompany(companyData: Omit<Company, 'id'>): Company {
    const companies = this.getCompanies();
    const newCompany: Company = {
      ...companyData,
      id: `company_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
    companies.push(newCompany);
    this.saveCompanies(companies);
    return newCompany;
  },

  updateCompany(id: string, fields: Partial<Company>): Company {
    const companies = this.getCompanies();
    const index = companies.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Empresa não encontrada');
    const updated = { ...companies[index], ...fields };
    companies[index] = updated;
    this.saveCompanies(companies);
    return updated;
  },

  deleteCompany(id: string): void {
    const companies = this.getCompanies();
    this.saveCompanies(companies.filter(c => c.id !== id));
  },

  // PRODUCTS
  getProducts(): Product[] {
    const data = localStorage.getItem(KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  },

  saveProducts(products: Product[]): void {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  addProduct(productData: Omit<Product, 'id'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...productData,
      id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
    products.push(newProduct);
    this.saveProducts(products);
    return newProduct;
  },

  updateProduct(id: string, fields: Partial<Product>): Product {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Produto não encontrado');
    const updated = { ...products[index], ...fields };
    products[index] = updated;
    this.saveProducts(products);
    return updated;
  },

  deleteProduct(id: string): void {
    const products = this.getProducts();
    this.saveProducts(products.filter(p => p.id !== id));
  },

  // SELLERS
  getSellers(): Seller[] {
    const data = localStorage.getItem(KEYS.SELLERS);
    return data ? JSON.parse(data) : [];
  },

  saveSellers(sellers: Seller[]): void {
    localStorage.setItem(KEYS.SELLERS, JSON.stringify(sellers));
  },

  addSeller(sellerData: Omit<Seller, 'id'>): Seller {
    const sellers = this.getSellers();
    const newSeller: Seller = {
      ...sellerData,
      id: `seller_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
    sellers.push(newSeller);
    this.saveSellers(sellers);
    return newSeller;
  },

  /**
   * Update seller.
   * SECURITY: If the seller is root_admin/isProtected, only allows password change.
   * All other fields are silently preserved from the existing record.
   */
  updateSeller(id: string, fields: Partial<Seller>): Seller {
    const sellers = this.getSellers();
    const index = sellers.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Usuário não encontrado');

    const existing = sellers[index];

    // === ROOT ADMIN PROTECTION ===
    if (isRootAdminUser(existing)) {
      // Only allow password field to change
      const updated: Seller = {
        ...existing,
        // Only update password if provided
        password: fields.password !== undefined ? fields.password : existing.password,
        // Force all protected fields to remain locked
        id: existing.id,
        name: existing.name,
        username: existing.username,
        email: existing.email,
        role: 'root_admin',
        companyId: null,
        companyName: 'Todas',
        isProtected: true,
        status: 'Ativo',
      };
      sellers[index] = updated;
      this.saveSellers(sellers);
      return updated;
    }
    // === END ROOT ADMIN PROTECTION ===

    const updated = { ...existing, ...fields };
    sellers[index] = updated;
    this.saveSellers(sellers);
    return updated;
  },

  /**
   * Delete seller.
   * SECURITY: Root admin can NEVER be deleted. Throws error if attempted.
   */
  deleteSeller(id: string): void {
    const sellers = this.getSellers();
    const target = sellers.find(s => s.id === id);

    if (target && isRootAdminUser(target)) {
      throw new Error('O administrador principal do sistema não pode ser excluído.');
    }

    this.saveSellers(sellers.filter(s => s.id !== id));
  },

  // EVENTS
  getEvents(): Event[] {
    const data = localStorage.getItem(KEYS.EVENTS);
    return data ? JSON.parse(data) : [];
  },

  saveEvents(events: Event[]): void {
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
  },

  addEvent(eventData: Omit<Event, 'id'>): Event {
    const events = this.getEvents();
    const newEvent: Event = {
      ...eventData,
      id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
    events.push(newEvent);
    this.saveEvents(events);
    return newEvent;
  },

  updateEvent(id: string, fields: Partial<Event>): Event {
    const events = this.getEvents();
    const index = events.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Evento não encontrado');
    const updated = { ...events[index], ...fields };
    events[index] = updated;
    this.saveEvents(events);
    return updated;
  },

  deleteEvent(id: string): void {
    const events = this.getEvents();
    this.saveEvents(events.filter(e => e.id !== id));
  },

  // LEADS
  getLeads(): Lead[] {
    const data = localStorage.getItem(KEYS.LEADS);
    return data ? JSON.parse(data) : [];
  },

  saveLeads(leads: Lead[]): void {
    localStorage.setItem(KEYS.LEADS, JSON.stringify(leads));
  },

  addLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'origin'>): Lead {
    const leads = this.getLeads();
    const newLead: Lead = {
      ...leadData,
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Novo',
      origin: 'evento/app'
    };
    leads.unshift(newLead);
    this.saveLeads(leads);
    return newLead;
  },

  deleteLead(id: string): void {
    const leads = this.getLeads();
    this.saveLeads(leads.filter(l => l.id !== id));
  },

  // SESSION
  getCurrentSeller(): Seller | null {
    const sellerId = localStorage.getItem(KEYS.CURRENT_SELLER_ID);
    if (!sellerId) return null;
    const sellers = this.getSellers();
    // Root admin uses status='Ativo' — accepts both 'Ativo' and 'active' for compatibility
    return sellers.find(s => s.id === sellerId && (s.status === 'Ativo' || s.status === 'active')) || null;
  },

  setCurrentSellerId(id: string | null): void {
    if (id) {
      localStorage.setItem(KEYS.CURRENT_SELLER_ID, id);
    } else {
      localStorage.removeItem(KEYS.CURRENT_SELLER_ID);
    }
  },

  getLeadsCountBySeller(sellerId: string): number {
    const leads = this.getLeads();
    return leads.filter(l => l.sellerId === sellerId).length;
  }
};
