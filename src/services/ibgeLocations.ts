export interface BrazilianState {
  id: number;
  name: string;
  uf: string;
}

export interface BrazilianCity {
  id: number;
  name: string;
}

const CACHE_KEYS = {
  STATES: 'leadCollector:brazilianStates',
  CITIES_PREFIX: 'leadCollector:brazilianCities:'
};

/**
 * Busca a lista de estados do Brasil.
 * Tenta ler do LocalStorage cache primeiro; se não houver, consome a API do IBGE.
 */
export async function getBrazilianStates(): Promise<BrazilianState[]> {
  try {
    const cached = localStorage.getItem(CACHE_KEYS.STATES);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error('Erro ao ler cache de estados:', e);
  }

  // Se não estiver em cache, faz fetch
  const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
  if (!response.ok) {
    throw new Error(`Erro HTTP IBGE: ${response.status}`);
  }
  const data = await response.json();
  const mapped: BrazilianState[] = data.map((item: any) => ({
    id: item.id,
    uf: item.sigla,
    name: item.nome
  }));

  try {
    localStorage.setItem(CACHE_KEYS.STATES, JSON.stringify(mapped));
  } catch (e) {
    console.error('Erro ao salvar cache de estados:', e);
  }

  return mapped;
}

/**
 * Busca todas as cidades/municípios pertencentes a um estado (UF) específico.
 * Tenta ler do LocalStorage cache primeiro; se não houver, consome a API do IBGE.
 */
export async function getBrazilianCitiesByState(uf: string): Promise<BrazilianCity[]> {
  if (!uf) return [];
  const normalizedUf = uf.toUpperCase().trim();
  const cacheKey = `${CACHE_KEYS.CITIES_PREFIX}${normalizedUf}`;

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error(`Erro ao ler cache de cidades para ${normalizedUf}:`, e);
  }

  // Se não estiver em cache, faz fetch
  const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${normalizedUf}/municipios?orderBy=nome`);
  if (!response.ok) {
    throw new Error(`Erro HTTP IBGE ao buscar cidades de ${normalizedUf}: ${response.status}`);
  }
  const data = await response.json();
  const mapped: BrazilianCity[] = data.map((item: any) => ({
    id: item.id,
    name: item.nome
  }));

  try {
    localStorage.setItem(cacheKey, JSON.stringify(mapped));
  } catch (e) {
    console.error(`Erro ao salvar cache de cidades para ${normalizedUf}:`, e);
  }

  return mapped;
}
