import { supabase } from '../lib/supabase';
import { leadCollectorStorage } from '../storage/leadCollectorStorage';
import { supabaseAuthService } from './supabaseAuthService';
import { supabaseCompanyService } from './supabaseCompanyService';
import { supabaseProfileService } from './supabaseProfileService';
import { supabaseProductService } from './supabaseProductService';
import { supabaseEventService } from './supabaseEventService';
import { supabaseLeadService } from './supabaseLeadService';

import { Company } from '../types/company';
import { Seller } from '../types/seller';
import { Product } from '../types/product';
import { Event } from '../types/event';
import { Lead } from '../types/lead';

// Detect if Supabase is active
const isSupabaseActive = !!supabase;

export const dataProvider = {
  isSupabase(): boolean {
    return isSupabaseActive;
  },

  // Auth / Session
  async login(loginValue: string, passwordValue: string): Promise<Seller> {
    if (isSupabaseActive) {
      return supabaseAuthService.login(loginValue, passwordValue);
    } else {
      const sellers = leadCollectorStorage.getSellers();
      const seller = sellers.find(
        (s) =>
          (s.username === loginValue.trim() || s.email === loginValue.trim()) &&
          s.password === passwordValue
      );
      if (!seller) {
        throw new Error('Usuário/E-mail ou senha incorretos.');
      }
      if (seller.status === 'Inativo') {
        throw new Error('Este usuário está inativo.');
      }
      leadCollectorStorage.setCurrentSellerId(seller.id);
      return seller;
    }
  },

  async logout(): Promise<void> {
    if (isSupabaseActive) {
      await supabaseAuthService.logout();
    } else {
      leadCollectorStorage.setCurrentSellerId(null);
    }
  },

  async getCurrentSeller(): Promise<Seller | null> {
    if (isSupabaseActive) {
      return supabaseAuthService.getCurrentSeller();
    } else {
      return leadCollectorStorage.getCurrentSeller();
    }
  },

  // Companies
  async getCompanies(): Promise<Company[]> {
    if (isSupabaseActive) {
      return supabaseCompanyService.getCompanies();
    } else {
      return leadCollectorStorage.getCompanies();
    }
  },

  async addCompany(companyData: Omit<Company, 'id'>): Promise<Company> {
    if (isSupabaseActive) {
      return supabaseCompanyService.addCompany(companyData);
    } else {
      return leadCollectorStorage.addCompany(companyData);
    }
  },

  async updateCompany(id: string, fields: Partial<Company>): Promise<Company> {
    if (isSupabaseActive) {
      return supabaseCompanyService.updateCompany(id, fields);
    } else {
      return leadCollectorStorage.updateCompany(id, fields);
    }
  },

  async deleteCompany(id: string): Promise<void> {
    if (isSupabaseActive) {
      await supabaseCompanyService.deleteCompany(id);
    } else {
      leadCollectorStorage.deleteCompany(id);
    }
  },

  // Profiles / Sellers
  async getSellers(): Promise<Seller[]> {
    if (isSupabaseActive) {
      return supabaseProfileService.getSellers();
    } else {
      return leadCollectorStorage.getSellers();
    }
  },

  async addSeller(sellerData: Omit<Seller, 'id'>): Promise<Seller> {
    if (isSupabaseActive) {
      return supabaseProfileService.addSeller(sellerData);
    } else {
      return leadCollectorStorage.addSeller(sellerData);
    }
  },

  async updateSeller(id: string, fields: Partial<Seller>): Promise<Seller> {
    if (isSupabaseActive) {
      return supabaseProfileService.updateSeller(id, fields);
    } else {
      return leadCollectorStorage.updateSeller(id, fields);
    }
  },

  async deleteSeller(id: string): Promise<void> {
    if (isSupabaseActive) {
      await supabaseProfileService.deleteSeller(id);
    } else {
      leadCollectorStorage.deleteSeller(id);
    }
  },

  // Products
  async getProducts(): Promise<Product[]> {
    if (isSupabaseActive) {
      return supabaseProductService.getProducts();
    } else {
      return leadCollectorStorage.getProducts();
    }
  },

  async addProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    if (isSupabaseActive) {
      return supabaseProductService.addProduct(productData);
    } else {
      return leadCollectorStorage.addProduct(productData);
    }
  },

  async updateProduct(id: string, fields: Partial<Product>): Promise<Product> {
    if (isSupabaseActive) {
      return supabaseProductService.updateProduct(id, fields);
    } else {
      return leadCollectorStorage.updateProduct(id, fields);
    }
  },

  async deleteProduct(id: string): Promise<void> {
    if (isSupabaseActive) {
      await supabaseProductService.deleteProduct(id);
    } else {
      leadCollectorStorage.deleteProduct(id);
    }
  },

  // Events
  async getEvents(): Promise<Event[]> {
    if (isSupabaseActive) {
      return supabaseEventService.getEvents();
    } else {
      return leadCollectorStorage.getEvents();
    }
  },

  async addEvent(eventData: Omit<Event, 'id'>): Promise<Event> {
    if (isSupabaseActive) {
      return supabaseEventService.addEvent(eventData);
    } else {
      return leadCollectorStorage.addEvent(eventData);
    }
  },

  async updateEvent(id: string, fields: Partial<Event>): Promise<Event> {
    if (isSupabaseActive) {
      return supabaseEventService.updateEvent(id, fields);
    } else {
      return leadCollectorStorage.updateEvent(id, fields);
    }
  },

  async deleteEvent(id: string): Promise<void> {
    if (isSupabaseActive) {
      await supabaseEventService.deleteEvent(id);
    } else {
      leadCollectorStorage.deleteEvent(id);
    }
  },

  // Leads
  async getLeads(): Promise<Lead[]> {
    if (isSupabaseActive) {
      return supabaseLeadService.getLeads();
    } else {
      return leadCollectorStorage.getLeads();
    }
  },

  async addLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'origin'>): Promise<Lead> {
    if (isSupabaseActive) {
      return supabaseLeadService.addLead(leadData);
    } else {
      return leadCollectorStorage.addLead(leadData);
    }
  },

  async deleteLead(id: string): Promise<void> {
    if (isSupabaseActive) {
      await supabaseLeadService.deleteLead(id);
    } else {
      leadCollectorStorage.deleteLead(id);
    }
  },

  async getLeadsCountBySeller(sellerId: string): Promise<number> {
    if (isSupabaseActive) {
      const leads = await supabaseLeadService.getLeads();
      return leads.filter(l => l.sellerId === sellerId).length;
    } else {
      return leadCollectorStorage.getLeadsCountBySeller(sellerId);
    }
  }
};
