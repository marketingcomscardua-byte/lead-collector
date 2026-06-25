import { Seller } from '../types/seller';
import { leadCollectorStorage } from '../storage/leadCollectorStorage';

/**
 * Lista fixa dos vendedores Portal Lead a serem recriados.
 * Cada entrada: [name, username, email]
 */
const PORTAL_LEAD_VENDORS: Array<[string, string, string]> = [
  ['Yuri',             'yuri',             'yuri@portallead.com.br'],
  ['Weverson',         'weverson',         'weverson@portallead.com.br'],
  ['Solimar',          'solimar',          'solimar@portallead.com.br'],
  ['Sandro',           'sandro',           'sandro@portallead.com.br'],
  ['Renato',           'renato',           'renato@portallead.com.br'],
  ['Rogério',          'rogerio',          'rogerio@portallead.com.br'],
  ['Pedro',            'pedro',            'pedro@portallead.com.br'],
  ['Patrick',          'patrick',          'patrick@portallead.com.br'],
  ['Maicon M.',        'maicon.m',         'maicon.m@portallead.com.br'],
  ['Maicon G.',        'maicon.g',         'maicon.g@portallead.com.br'],
  ['Leonardo',         'leonardo',         'leonardo@portallead.com.br'],
  ['Leon',             'leon',             'leon@portallead.com.br'],
  ['Juliano',          'juliano',          'juliano@portallead.com.br'],
  ['Junio Gonçalves',  'junio.goncalves',  'junio.goncalves@portallead.com.br'],
  ['Junior Vivas',     'junior.vivas',     'junior.vivas@portallead.com.br'],
  ['Jeferson',         'jeferson',         'jeferson@portallead.com.br'],
  ['Grimaldo',         'grimaldo',         'grimaldo@portallead.com.br'],
  ['Felipe',           'felipe',           'felipe@portallead.com.br'],
  ['Flavio',           'flavio',           'flavio@portallead.com.br'],
  ['Fernando Delai',   'fernando.delai',   'fernando.delai@portallead.com.br'],
  ['Ernandes',         'ernandes',         'ernandes@portallead.com.br'],
  ['Emilio',           'emilio',           'emilio@portallead.com.br'],
  ['Derick',           'derick',           'derick@portallead.com.br'],
  ['Bruno',            'bruno',            'bruno@portallead.com.br'],
  ['Arthur',           'arthur',           'arthur@portallead.com.br'],
  ['Andre',            'andre',            'andre@portallead.com.br'],
];

export interface BulkCreateResult {
  created: number;
  skipped: number;
  names: string[];      // nomes criados
  skippedNames: string[]; // nomes ignorados (já existiam)
}

/**
 * Cria em massa os vendedores Portal Lead.
 *
 * Regras:
 * - Não duplica: verifica por email OU username (case-insensitive).
 * - Não toca no root admin (admin@scardua.com.br).
 * - Todos criados com role 'vendor', status 'Ativo', senha '123456'.
 *
 * @returns relatório com quantos foram criados vs. ignorados.
 */
export function bulkCreatePortalLeadVendors(): BulkCreateResult {
  const existingSellers = leadCollectorStorage.getSellers();

  let created = 0;
  let skipped = 0;
  const names: string[] = [];
  const skippedNames: string[] = [];

  for (const [name, username, email] of PORTAL_LEAD_VENDORS) {
    const alreadyExists = existingSellers.some(
      (s) =>
        (s.email && s.email.toLowerCase() === email.toLowerCase()) ||
        (s.username && s.username.toLowerCase() === username.toLowerCase())
    );

    if (alreadyExists) {
      skipped++;
      skippedNames.push(name);
      continue;
    }

    const newSeller: Omit<Seller, 'id'> = {
      name,
      username,
      email,
      phone: '27999999999',
      password: '123456',
      role: 'vendor',
      companyId: null,
      companyName: 'Sem Empresa',
      status: 'Ativo',
      isProtected: false,
    };

    leadCollectorStorage.addSeller(newSeller);
    // Keep existing sellers in sync for duplicate check within same run
    existingSellers.push({ ...newSeller, id: '_temp' });

    created++;
    names.push(name);
  }

  return { created, skipped, names, skippedNames };
}
