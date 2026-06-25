export interface Seller {
  id: string;
  name: string;
  phone: string;
  email?: string;
  username?: string;
  password?: string;
  /** Base64 data URL for the seller's profile photo. */
  avatar?: string;
  /**
   * Role hierarchy:
   *  - 'root_admin'    → Admin principal/protegido do sistema (admin@scardua.com.br)
   *  - 'company_admin' → Admin de empresa (escopo limitado à empresa)
   *  - 'vendor'        → Vendedor (apenas fluxo mobile)
   *
   * Aliases legados (mantidos para retrocompatibilidade com dados antigos no localStorage):
   *  - 'Admin'    → equivale a 'company_admin' ou 'root_admin' conforme isProtected
   *  - 'Vendedor' → equivale a 'vendor'
   */
  role: 'root_admin' | 'company_admin' | 'vendor' | 'Admin' | 'Vendedor';
  /**
   * Se true, o usuário é o root admin e não pode ser excluído nem alterado
   * (exceto a senha). Deve ser definido apenas para admin@scardua.com.br.
   */
  isProtected?: boolean;
  companyId?: string | null;
  companyName?: string;
  status: 'Ativo' | 'Inativo' | 'active';
}

import { isRootAdmin as isRootAdminUser, isAdminRole } from '../utils/accessControl';

export { isRootAdminUser, isAdminRole };
