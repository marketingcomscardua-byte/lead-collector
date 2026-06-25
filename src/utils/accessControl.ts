import { Seller } from '../types/seller';
import { Lead } from '../types/lead';
import { Event } from '../types/event';
import { Company } from '../types/company';
import { Product } from '../types/product';

/**
 * Verifica se um usuário é o Root Admin do sistema.
 */
export function isRootAdmin(user: Seller | null | undefined): boolean {
  if (!user) return false;
  return (
    user.email === 'admin@scardua.com.br' ||
    user.role === 'root_admin' ||
    user.isProtected === true
  );
}

/**
 * Alias para verificação de Root Admin protegido.
 */
export function isProtectedRootAdmin(user: Seller | null | undefined): boolean {
  return isRootAdmin(user);
}

/**
 * Verifica se um usuário é Admin de Empresa (mas não Root Admin).
 */
export function isCompanyAdmin(user: Seller | null | undefined): boolean {
  if (!user) return false;
  return (user.role === 'company_admin' || user.role === 'Admin') && !isRootAdmin(user);
}

/**
 * Verifica se o usuário é Vendedor.
 */
export function isVendor(user: Seller | null | undefined): boolean {
  if (!user) return false;
  return user.role === 'vendor' || user.role === 'Vendedor';
}

/**
 * Verifica se a role possui acesso administrativo.
 */
export function isAdminRole(role: Seller['role']): boolean {
  return role === 'root_admin' || role === 'company_admin' || role === 'Admin';
}

/**
 * Verifica se o usuário atual pode ver os dados de uma empresa específica.
 */
export function canSeeCompanyData(currentUser: Seller, companyId: string | null | undefined): boolean {
  if (isRootAdmin(currentUser)) return true;
  return !!(currentUser.companyId && currentUser.companyId === companyId);
}

/**
 * Filtra a lista de usuários baseada no nível de acesso do usuário atual.
 */
export function filterUsersByAccess(currentUser: Seller, users: Seller[]): Seller[] {
  if (isRootAdmin(currentUser)) return users;
  if (isCompanyAdmin(currentUser)) {
    return users.filter((u) => u.companyId === currentUser.companyId);
  }
  return [];
}

/**
 * Filtra a lista de leads baseada no nível de acesso do usuário atual.
 */
export function filterLeadsByAccess(currentUser: Seller, leads: Lead[]): Lead[] {
  if (isRootAdmin(currentUser)) return leads;
  if (isCompanyAdmin(currentUser)) {
    return leads.filter((l) => l.companyId === currentUser.companyId);
  }
  return [];
}

/**
 * Filtra a lista de produtos baseada no nível de acesso do usuário atual.
 */
export function filterProductsByAccess(currentUser: Seller, products: Product[]): Product[] {
  if (isRootAdmin(currentUser)) return products;
  if (isCompanyAdmin(currentUser)) {
    return products.filter((p) => p.companyId === currentUser.companyId);
  }
  return [];
}

/**
 * Filtra a lista de empresas baseada no nível de acesso do usuário atual.
 */
export function filterCompaniesByAccess(currentUser: Seller, companies: Company[]): Company[] {
  if (isRootAdmin(currentUser)) return companies;
  if (isCompanyAdmin(currentUser)) {
    return companies.filter((c) => c.id === currentUser.companyId);
  }
  return [];
}

/**
 * Filtra a lista de eventos baseada no nível de acesso do usuário atual.
 * Um admin de empresa vê apenas os eventos vinculados a vendedores ou produtos de sua empresa.
 */
export function filterEventsByAccess(
  currentUser: Seller,
  events: Event[],
  sellers: Seller[],
  products: Product[]
): Event[] {
  if (isRootAdmin(currentUser)) return events;
  if (isCompanyAdmin(currentUser)) {
    const companySellerIds = sellers
      .filter((s) => s.companyId === currentUser.companyId)
      .map((s) => s.id);
    const companyProductIds = products
      .filter((p) => p.companyId === currentUser.companyId)
      .map((p) => p.id);

    return events.filter(
      (e) =>
        (e.sellerIds && e.sellerIds.some((id) => companySellerIds.includes(id))) ||
        (e.productIds && e.productIds.some((id) => companyProductIds.includes(id)))
    );
  }
  return [];
}
