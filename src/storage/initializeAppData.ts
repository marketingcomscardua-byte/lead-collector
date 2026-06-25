import { leadCollectorStorage } from './leadCollectorStorage';
import { ROOT_ADMIN_SEED, SEED_COMPANIES } from '../data/seed';
import { DEFAULT_VENDORS } from '../data/defaultVendors';
import importedProducts from '../data/importedProducts.json';
import { Seller } from '../types/seller';
import { Company } from '../types/company';
import { Product } from '../types/product';
import { classifyProduct, PRODUCT_CATEGORIES } from '../utils/productClassification';

function normalizeKey(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function getProductMergeKey(name: string, companyName: string) {
  return `${normalizeKey(name)}::${normalizeKey(companyName)}`;
}

export function initializeAppData() {
  ensureRootAdmin();
  ensureDefaultCompanies();
  ensureDefaultVendors();
  ensureImportedProducts();
  migrateAllProductBrandsAndCompanies();
  migrateOldRoles();
}

function ensureRootAdmin() {
  const sellers = leadCollectorStorage.getSellers();
  const existingAdminIdx = sellers.findIndex(
    s => s.email === 'admin@scardua.com.br' || s.id === 's_admin' || s.id === 'root-admin'
  );

  if (existingAdminIdx === -1) {
    // If not found, insert at the beginning
    sellers.unshift(ROOT_ADMIN_SEED);
    leadCollectorStorage.saveSellers(sellers);
  } else {
    // Merge: preserve password, lock everything else
    const existing = sellers[existingAdminIdx];
    const migrated: Seller = {
      ...existing,
      id: 'root-admin',
      name: ROOT_ADMIN_SEED.name,
      username: ROOT_ADMIN_SEED.username,
      email: ROOT_ADMIN_SEED.email,
      phone: existing.phone || ROOT_ADMIN_SEED.phone,
      role: ROOT_ADMIN_SEED.role,
      companyId: null,
      companyName: ROOT_ADMIN_SEED.companyName,
      isProtected: true,
      status: ROOT_ADMIN_SEED.status,
      password: existing.password || ROOT_ADMIN_SEED.password,
    };
    sellers[existingAdminIdx] = migrated;
    leadCollectorStorage.saveSellers(sellers);
  }

  // Session normalization if session seller ID points to old ID
  const currentSellerId = localStorage.getItem('lead_collector_v3_current_seller_id');
  if (currentSellerId === 's_admin') {
    localStorage.setItem('lead_collector_v3_current_seller_id', 'root-admin');
  }
}

function ensureDefaultCompanies() {
  const existingCompanies = leadCollectorStorage.getCompanies();
  let updated = false;

  for (const seedComp of SEED_COMPANIES) {
    const seedNorm = normalizeKey(seedComp.name);
    const exists = existingCompanies.some(c => normalizeKey(c.name) === seedNorm);
    if (!exists) {
      existingCompanies.push(seedComp);
      updated = true;
    }
  }

  if (updated) {
    leadCollectorStorage.saveCompanies(existingCompanies);
  }
}

function ensureDefaultVendors() {
  const sellers = leadCollectorStorage.getSellers();
  let updated = false;

  for (const defaultVendor of DEFAULT_VENDORS) {
    const emailNorm = normalizeKey(defaultVendor.email || '');
    const usernameNorm = normalizeKey(defaultVendor.username || '');

    const exists = sellers.some(s => 
      (s.email && normalizeKey(s.email) === emailNorm) ||
      (s.username && normalizeKey(s.username) === usernameNorm)
    );

    if (!exists) {
      const newVendor: Seller = {
        ...defaultVendor,
        id: `seller_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      };
      sellers.push(newVendor);
      updated = true;
    }
  }

  if (updated) {
    leadCollectorStorage.saveSellers(sellers);
  }
}

function ensureImportedProducts() {
  const products = leadCollectorStorage.getProducts();
  let updated = false;

  for (const imp of importedProducts) {
    // Classify dynamically based on source company and path if available
    const classification = classifyProduct(imp.name, imp.companyName, (imp as any).sourcePath);
    const key = getProductMergeKey(imp.name, classification.companyName);
    
    const exists = products.some(p => getProductMergeKey(p.name, p.companyName || '') === key);
    if (!exists) {
      const newProduct: Product = {
        id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: imp.name,
        brand: classification.brand,
        category: imp.category || classification.category || 'Outros',
        companyId: imp.companyId || null,
        companyName: classification.companyName,
        status: (imp.status as 'Ativo' | 'Inativo' | 'active') || 'Ativo',
      } as any;

      products.push(newProduct);
      updated = true;
    }
  }

  if (updated) {
    leadCollectorStorage.saveProducts(products);
  }
}

function migrateAllProductBrandsAndCompanies() {
  const products = leadCollectorStorage.getProducts();
  let updated = false;

  for (const p of products) {
    const classification = classifyProduct(p.name, p.companyName, (p as any).sourcePath);
    const isCategoryInvalid = !p.category || !PRODUCT_CATEGORIES.includes(p.category as any);

    if (
      p.brand !== classification.brand ||
      p.companyName !== classification.companyName ||
      isCategoryInvalid ||
      (p.category === 'Outros' && classification.category !== 'Outros')
    ) {
      p.brand = classification.brand;
      p.companyName = classification.companyName;
      if (isCategoryInvalid) {
        p.category = classification.category;
      } else if (p.category === 'Outros' || !p.category) {
        p.category = classification.category;
      }
      updated = true;
    }
  }

  if (updated) {
    leadCollectorStorage.saveProducts(products);
  }
}

function migrateOldRoles() {
  const sellers = leadCollectorStorage.getSellers();
  let updated = false;

  for (const s of sellers) {
    if (s.role === 'Admin') {
      s.role = s.isProtected ? 'root_admin' : 'company_admin';
      updated = true;
    } else if (s.role === 'Vendedor') {
      s.role = 'vendor';
      updated = true;
    }
  }

  if (updated) {
    leadCollectorStorage.saveSellers(sellers);
  }
}
