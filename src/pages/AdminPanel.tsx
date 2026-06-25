import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, Trash2, Edit2, Download, Calendar, 
  Database, TrendingUp, AlertCircle, X, Check, Shield, Users
} from 'lucide-react';
import { leadCollectorStorage } from '../storage/leadCollectorStorage';
import { Event } from '../types/event';
import { Seller } from '../types/seller';
import { Company } from '../types/company';
import { Product } from '../types/product';
import { Lead } from '../types/lead';
import { 
  getBrazilianStates, 
  getBrazilianCitiesByState, 
  BrazilianState, 
  BrazilianCity 
} from '../services/ibgeLocations';
import { BRAZIL_STATES_FALLBACK } from '../data/brazilLocationsFallback';
import { bulkCreatePortalLeadVendors } from '../utils/bulkCreateVendors';

interface AdminPanelProps {
  currentTab: string;
  seller: Seller;
}


import { 
  isRootAdmin, 
  isVendor,
  filterUsersByAccess, 
  filterLeadsByAccess, 
  filterProductsByAccess, 
  filterCompaniesByAccess, 
  filterEventsByAccess 
} from '../utils/accessControl';

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentTab, seller }) => {
  // Collections lists
  const [events, setEvents] = useState<Event[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  // Modals management
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalError, setModalError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Forms inputs state
  // 1. Event Form
  const [states, setStates] = useState<BrazilianState[]>([]);
  const [evName, setEvName] = useState('');
  const [evStartDate, setEvStartDate] = useState('');
  const [evEndDate, setEvEndDate] = useState('');
  const [evState, setEvState] = useState('');
  const [evStateUf, setEvStateUf] = useState('');
  const [evCity, setEvCity] = useState('');
  const [evCityId, setEvCityId] = useState<number | null>(null);
  const [evCityQuery, setEvCityQuery] = useState('');
  const [showEvCitiesDropdown, setShowEvCitiesDropdown] = useState(false);
  const [evCities, setEvCities] = useState<BrazilianCity[]>([]);
  const [evCitiesLoading, setEvCitiesLoading] = useState(false);
  const [evIbgeError, setEvIbgeError] = useState('');
  const [evLocation, setEvLocation] = useState('');
  const [evDescription, setEvDescription] = useState('');
  const [evProductIds, setEvProductIds] = useState<string[]>([]);
  const [evSellerIds, setEvSellerIds] = useState<string[]>([]);
  const [evStatus, setEvStatus] = useState<'active' | 'future' | 'completed'>('active');
  const evDropdownRef = React.useRef<HTMLDivElement>(null);

  // 2. Company Form
  const [coName, setCoName] = useState('');
  const [coEmail, setCoEmail] = useState('');
  const [coPhone, setCoPhone] = useState('');
  const [coCnpj, setCoCnpj] = useState('');
  const [coStatus, setCoStatus] = useState<'Ativo' | 'Inativo'>('Ativo');

  // 3. Seller Form
  const [seName, setSeName] = useState('');
  const [seUsername, setSeUsername] = useState('');
  const [seEmail, setSeEmail] = useState('');
  const [sePhone, setSePhone] = useState('');
  const [sePassword, setSePassword] = useState('');
  const [seCompanyId, setSeCompanyId] = useState('');
  const [seRole, setSeRole] = useState<Seller['role']>('vendor');
  const [seStatus, setSeStatus] = useState<Seller['status']>('Ativo');

  // 4. Product Form
  const [prName, setPrName] = useState('');
  const [prCompanyId, setPrCompanyId] = useState('');
  const [prBrand, setPrBrand] = useState('');
  const [prCategory, setPrCategory] = useState('');
  const [prLine, setPrLine] = useState('');
  const [prStatus, setPrStatus] = useState<'Ativo' | 'Inativo'>('Ativo');

  // 5. Product filters (aba Produtos)
  const [pfSearch, setPfSearch] = useState('');
  const [pfLine, setPfLine] = useState('');
  const [pfCategory, setPfCategory] = useState('');
  const [pfBrand, setPfBrand] = useState('');
  const [pfStatus, setPfStatus] = useState('');

  // 6. Product search inside event modal
  const [evProductSearch, setEvProductSearch] = useState('');

  // Load lists
  const loadAll = useCallback(() => {
    const rawEvents = leadCollectorStorage.getEvents();
    const rawCompanies = leadCollectorStorage.getCompanies();
    const rawSellers = leadCollectorStorage.getSellers();
    let rawProducts = leadCollectorStorage.getProducts();
    const rawLeads = leadCollectorStorage.getLeads();

    // Normalization of products brands, lines, and categories
    let updatedAny = false;
    const normalizedProducts = rawProducts.map(p => {
      let changed = false;
      let brand = p.brand || '';
      let category = p.category || '';
      let line = p.line || '';

      // Normalize brand
      const bNorm = brand.trim().toLowerCase();
      let newBrand = 'Outras';
      if (bNorm === 'sunward' || bNorm === 'sundward' || bNorm === 'sumward' || bNorm === 'sw') {
        newBrand = 'Sunward';
      } else if (bNorm === 'agritech') {
        newBrand = 'Agritech';
      } else if (bNorm === 'moldemaq') {
        newBrand = 'Moldemaq';
      } else if (bNorm === 'yto') {
        newBrand = 'YTO';
      } else if (bNorm === 'barbieri') {
        newBrand = 'Barbieri';
      } else if (bNorm === 'mercury') {
        newBrand = 'Mercury';
      } else if (bNorm === 'fibrafort') {
        newBrand = 'Fibrafort';
      } else if (bNorm === 'ventura') {
        newBrand = 'Ventura';
      } else if (bNorm === 'comercial scardua' || bNorm === 'c. scardua') {
        newBrand = 'Comercial Scardua';
      } else if (bNorm === 'porto livre') {
        newBrand = 'Porto Livre';
      } else if (bNorm === 'outras' || bNorm === 'outra') {
        newBrand = 'Outras';
      }

      // Regra especial Sunward for SWE / SWL
      const nameNorm = p.name.trim().toUpperCase();
      if (nameNorm.startsWith('SWE') || nameNorm.startsWith('SWL')) {
        newBrand = 'Sunward';
      }

      if (newBrand !== p.brand) {
        brand = newBrand;
        changed = true;
      }

      // Normalize Category
      const catNorm = category.trim().toLowerCase();
      let newCat = 'Outros';
      if (catNorm === 'trator') newCat = 'Trator';
      else if (catNorm === 'microtrator' || catNorm === 'micro trator') newCat = 'Microtrator';
      else if (catNorm === 'transportador agrícola' || catNorm === 'transportador agricola' || catNorm === 'transportador') newCat = 'Transportador Agrícola';
      else if (catNorm === 'escavadeira') newCat = 'Escavadeira';
      else if (catNorm === 'mini escavadeira' || catNorm === 'miniescavadeira') newCat = 'Mini Escavadeira';
      else if (catNorm === 'pá carregadeira' || catNorm === 'pa carregadeira' || catNorm === 'pa-carregadeira') newCat = 'Pá Carregadeira';
      else if (catNorm === 'rolo compactador' || catNorm === 'rolo') newCat = 'Rolo Compactador';
      else if (catNorm === 'retroescavadeira' || catNorm === 'retro') newCat = 'Retroescavadeira';
      else if (catNorm === 'barco') newCat = 'Barco';
      else if (catNorm === 'motor') newCat = 'Motor';
      else if (catNorm === 'jet ski' || catNorm === 'jetski') newCat = 'Jet Ski';
      else if (catNorm === 'quadriciclo') newCat = 'Quadriciclo';
      else if (catNorm === 'peças' || catNorm === 'pecas') newCat = 'Peças';
      else if (catNorm === 'serviço' || catNorm === 'servico') newCat = 'Serviço';
      else if (catNorm === 'outros' || catNorm === 'outro') newCat = 'Outros';

      if (newCat !== p.category) {
        category = newCat;
        changed = true;
      }

      // Normalize Line
      const lineNorm = line.trim().toLowerCase();
      let newLine = 'Outros';
      if (lineNorm === 'linha agricola' || lineNorm === 'linha agrícola') newLine = 'Linha Agrícola';
      else if (lineNorm === 'linha amarela') newLine = 'Linha Amarela';
      else if (lineNorm === 'linha náutica' || lineNorm === 'linha nautica') newLine = 'Linha Náutica';
      else if (lineNorm === 'porto livre') newLine = 'Porto Livre';
      else if (lineNorm === 'outros' || lineNorm === 'outro') newLine = 'Outros';

      if (newLine !== p.line) {
        line = newLine;
        changed = true;
      }

      if (changed) {
        updatedAny = true;
        return {
          ...p,
          brand,
          category,
          line
        };
      }
      return p;
    });

    if (updatedAny) {
      leadCollectorStorage.saveProducts(normalizedProducts);
      rawProducts = normalizedProducts;
    }

    const filteredEvents = filterEventsByAccess(seller, rawEvents, rawSellers, rawProducts);
    const filteredCompanies = filterCompaniesByAccess(seller, rawCompanies);
    const filteredSellers = filterUsersByAccess(seller, rawSellers);
    const filteredProducts = filterProductsByAccess(seller, rawProducts);
    const filteredLeads = filterLeadsByAccess(seller, rawLeads);

    setEvents(filteredEvents);
    setCompanies(filteredCompanies);
    setSellers(filteredSellers);
    setProducts(filteredProducts);
    setLeads(filteredLeads);
  }, [seller]);

  useEffect(() => {
    loadAll();
  }, [currentTab, loadAll]);

  // Close evDropdownRef on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (evDropdownRef.current && !evDropdownRef.current.contains(event.target as Node)) {
        setShowEvCitiesDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch states on mount
  useEffect(() => {
    async function loadStates() {
      try {
        const fetched = await getBrazilianStates();
        setStates(fetched);
      } catch {
        setStates(BRAZIL_STATES_FALLBACK);
      }
    }
    loadStates();
  }, []);

  const showBanner = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(''), 3000);
  };

  // ==========================================
  // DASHBOARD CALCULATIONS
  // ==========================================
  const totalLeads = leads.length;
  
  const leadsToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return leads.filter(l => l.createdAt.startsWith(today)).length;
  }, [leads]);

  const leadsLast7Days = useMemo(() => {
    const limit = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return leads.filter(l => new Date(l.createdAt).getTime() >= limit).length;
  }, [leads]);

  const sellersRanking = useMemo(() => {
    const counts: Record<string, { name: string; count: number }> = {};
    leads.forEach(l => {
      if (!counts[l.sellerId]) {
        counts[l.sellerId] = { name: l.sellerName, count: 0 };
      }
      counts[l.sellerId].count += 1;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [leads]);

  const eventsRanking = useMemo(() => {
    const counts: Record<string, { name: string; count: number }> = {};
    leads.forEach(l => {
      if (!counts[l.eventId]) {
        counts[l.eventId] = { name: l.eventName, count: 0 };
      }
      counts[l.eventId].count += 1;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [leads]);

  const productsRanking = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(l => {
      l.products.forEach(p => {
        counts[p] = (counts[p] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [leads]);


  // ==========================================
  // ACTIONS / CRUDS
  // ==========================================

  const loadCitiesForState = async (uf: string) => {
    setEvCitiesLoading(true);
    setEvIbgeError('');
    try {
      const fetched = await getBrazilianCitiesByState(uf);
      setEvCities(fetched);
    } catch {
      setEvIbgeError('Não foi possível carregar cidades pelo IBGE agora. Você pode digitar a cidade manualmente.');
    } finally {
      setEvCitiesLoading(false);
    }
  };

  const handleEvStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUf = e.target.value;
    const stateObj = states.find(s => s.uf === selectedUf);

    if (stateObj) {
      setEvState(stateObj.name);
      setEvStateUf(stateObj.uf);
      loadCitiesForState(stateObj.uf);
    } else {
      setEvState('');
      setEvStateUf('');
      setEvCities([]);
    }

    setEvCity('');
    setEvCityQuery('');
    setEvCityId(null);
    setShowEvCitiesDropdown(false);
    setEvIbgeError('');
  };

  const handleEvCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEvCity(val);
    setEvCityQuery(val);

    const exactMatch = evCities.find(c => c.name.toLowerCase() === val.trim().toLowerCase());
    if (exactMatch) {
      setEvCityId(exactMatch.id);
    } else {
      setEvCityId(null);
    }
    setShowEvCitiesDropdown(true);
  };

  const handleEvSelectCity = (c: BrazilianCity) => {
    setEvCity(c.name);
    setEvCityQuery(c.name);
    setEvCityId(c.id);
    setShowEvCitiesDropdown(false);
  };

  const filteredEvCities = useMemo(() => {
    if (!evCityQuery.trim()) return evCities.slice(0, 100);
    return evCities.filter(c => 
      c.name.toLowerCase().includes(evCityQuery.toLowerCase())
    ).slice(0, 100);
  }, [evCities, evCityQuery]);

  // --- EVENTS ---
  const handleOpenAddEvent = () => {
    setSelectedItem(null);
    setEvName('');
    setEvStartDate('');
    setEvEndDate('');
    setEvState('');
    setEvStateUf('');
    setEvCity('');
    setEvCityId(null);
    setEvCityQuery('');
    setEvCities([]);
    setShowEvCitiesDropdown(false);
    setEvIbgeError('');
    setEvLocation('');
    setEvDescription('');
    setEvProductIds([]);
    setEvSellerIds([]);
    setEvStatus('active');
    setModalError('');
    setActiveModal('event');
  };

  const handleOpenEditEvent = (evt: Event) => {
    setSelectedItem(evt);
    setEvName(evt.name);
    setEvStartDate(evt.startDate);
    setEvEndDate(evt.endDate);
    setEvState(evt.state);
    setEvStateUf(evt.stateUf || '');
    setEvCity(evt.city);
    setEvCityId(evt.cityId || null);
    setEvCityQuery(evt.city);
    setEvCities([]);
    setShowEvCitiesDropdown(false);
    setEvIbgeError('');
    setEvLocation(evt.location);
    setEvDescription(evt.description || '');
    setEvProductIds(evt.productIds || []);
    setEvSellerIds(evt.sellerIds || []);
    setEvStatus(evt.status);
    setModalError('');
    setActiveModal('event');
    if (evt.stateUf) {
      loadCitiesForState(evt.stateUf);
    }
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!evName.trim() || !evStartDate || !evEndDate || !evStateUf || !evCity.trim() || !evLocation.trim()) {
      setModalError('Preencha todos os campos obrigatórios (*).');
      return;
    }

    const payload = {
      name: evName,
      startDate: evStartDate,
      endDate: evEndDate,
      state: evState,
      stateUf: evStateUf,
      city: evCity,
      cityId: evCityId,
      location: evLocation,
      description: evDescription,
      status: evStatus,
      productIds: evProductIds,
      sellerIds: evSellerIds
    };

    if (selectedItem) {
      leadCollectorStorage.updateEvent(selectedItem.id, payload);
      showBanner('Evento atualizado com sucesso!');
    } else {
      leadCollectorStorage.addEvent(payload);
      showBanner('Evento adicionado com sucesso!');
    }
    setActiveModal(null);
    loadAll();
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      leadCollectorStorage.deleteEvent(id);
      showBanner('Evento excluído.');
      loadAll();
    }
  };

  // --- COMPANIES ---
  const handleOpenAddCompany = () => {
    setSelectedItem(null);
    setCoName('');
    setCoEmail('');
    setCoPhone('');
    setCoCnpj('');
    setCoStatus('Ativo');
    setModalError('');
    setActiveModal('company');
  };

  const handleOpenEditCompany = (co: Company) => {
    setSelectedItem(co);
    setCoName(co.name);
    setCoEmail(co.email || '');
    setCoPhone(co.phone || '');
    setCoCnpj(co.cnpj || '');
    setCoStatus(co.status);
    setModalError('');
    setActiveModal('company');
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!coName.trim()) {
      setModalError('Nome da empresa é obrigatório.');
      return;
    }

    const payload = {
      name: coName,
      email: coEmail,
      phone: coPhone,
      cnpj: coCnpj,
      status: coStatus
    };

    if (selectedItem) {
      leadCollectorStorage.updateCompany(selectedItem.id, payload);
      showBanner('Empresa atualizada!');
      // Update companyName on associated products and sellers automatically
      const sellersList = leadCollectorStorage.getSellers();
      sellersList.forEach(s => {
        if (s.companyId === selectedItem.id) {
          leadCollectorStorage.updateSeller(s.id, { companyName: coName });
        }
      });
      const productsList = leadCollectorStorage.getProducts();
      productsList.forEach(p => {
        if (p.companyId === selectedItem.id) {
          leadCollectorStorage.updateProduct(p.id, { companyName: coName });
        }
      });
    } else {
      leadCollectorStorage.addCompany(payload);
      showBanner('Empresa adicionada!');
    }
    setActiveModal(null);
    loadAll();
  };

  const handleDeleteCompany = (id: string) => {
    if (window.confirm('Excluir empresa? Vendedores associados ficarão como "Sem Empresa".')) {
      leadCollectorStorage.deleteCompany(id);
      // Clean association
      const sellersList = leadCollectorStorage.getSellers();
      sellersList.forEach(s => {
        if (s.companyId === id) {
          leadCollectorStorage.updateSeller(s.id, { companyId: '', companyName: 'Sem Empresa' });
        }
      });
      showBanner('Empresa excluída.');
      loadAll();
    }
  };

  // --- SELLERS ---
  const handleOpenAddSeller = () => {
    setSelectedItem(null);
    setSeName('');
    setSeUsername('');
    setSeEmail('');
    setSePhone('');
    setSePassword('');
    setSeCompanyId('');
    setSeRole('vendor');
    setSeStatus('Ativo');
    setModalError('');
    setActiveModal('seller');
  };

  const handleOpenEditSeller = (sel: Seller) => {
    setSelectedItem(sel);
    setSeName(sel.name);
    setSeUsername(sel.username || '');
    setSeEmail(sel.email || '');
    setSePhone(sel.phone);
    setSePassword(sel.password || '');
    setSeCompanyId(sel.companyId || '');
    setSeRole(sel.role);
    setSeStatus(sel.status);
    setModalError('');
    setActiveModal('seller');
  };

  const handleSaveSeller = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    // If editing root admin → only password allowed
    if (selectedItem && isRootAdmin(selectedItem)) {
      if (!sePassword.trim()) {
        setModalError('A nova senha não pode ser vazia.');
        return;
      }
      leadCollectorStorage.updateSeller(selectedItem.id, { password: sePassword });
      showBanner('Senha do administrador principal atualizada com sucesso!');
      setActiveModal(null);
      loadAll();
      return;
    }

    if (!seName.trim() || !seUsername.trim() || !sePassword.trim() || !sePhone.trim()) {
      setModalError('Nome, Usuário, Celular e Senha são obrigatórios.');
      return;
    }

    const matchedCo = companies.find(c => c.id === seCompanyId);
    const coName = matchedCo ? matchedCo.name : 'Sem Empresa';

    const payload = {
      name: seName,
      username: seUsername,
      email: seEmail,
      phone: sePhone,
      password: sePassword,
      companyId: seCompanyId,
      companyName: coName,
      role: seRole,
      status: seStatus
    };

    if (selectedItem) {
      leadCollectorStorage.updateSeller(selectedItem.id, payload);
      showBanner('Usuário atualizado!');
    } else {
      // Check duplicate usernames
      const exist = sellers.some(s => s.username === seUsername);
      if (exist) {
        setModalError('Este nome de usuário já está cadastrado.');
        return;
      }
      leadCollectorStorage.addSeller(payload);
      showBanner('Usuário cadastrado!');
    }
    setActiveModal(null);
    loadAll();
  };

  const handleDeleteSeller = (id: string) => {
    const target = sellers.find(s => s.id === id);
    if (target && isRootAdmin(target)) {
      setModalError('O administrador principal do sistema não pode ser excluído.');
      setSuccessBanner('');
      // Show as a temporary error notification
      setActiveModal('root-admin-error');
      return;
    }
    if (window.confirm('Deseja excluir este vendedor?')) {
      try {
        leadCollectorStorage.deleteSeller(id);
        showBanner('Vendedor excluído.');
        loadAll();
      } catch (err: any) {
        alert(err.message || 'Não foi possível excluir este usuário.');
      }
    }
  };

  // --- PRODUCTS ---
  const handleOpenAddProduct = () => {
    setSelectedItem(null);
    setPrName('');
    setPrCompanyId('');
    setPrBrand('');
    setPrCategory('');
    setPrLine('');
    setPrStatus('Ativo');
    setModalError('');
    setActiveModal('product');
  };

  const handleOpenEditProduct = (pr: Product) => {
    setSelectedItem(pr);
    setPrName(pr.name);
    setPrCompanyId(pr.companyId || '');
    setPrBrand(pr.brand || '');
    setPrCategory(pr.category || '');
    setPrLine((pr as any).line || '');
    setPrStatus(pr.status);
    setModalError('');
    setActiveModal('product');
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!prName.trim()) {
      setModalError('Nome do produto é obrigatório.');
      return;
    }

    const matchedCo = companies.find(c => c.id === prCompanyId);
    const coName = matchedCo ? matchedCo.name : 'Sem Empresa';

    // Auto-normalize/enforce Sunward for SWE / SWL
    let finalBrand = prBrand;
    const nameNorm = prName.trim().toUpperCase();
    if (nameNorm.startsWith('SWE') || nameNorm.startsWith('SWL')) {
      finalBrand = 'Sunward';
    }

    const payload = {
      name: prName,
      companyId: prCompanyId,
      companyName: coName,
      brand: finalBrand || 'Outras',
      category: prCategory || 'Outros',
      line: prLine || 'Outros',
      status: prStatus
    };

    if (selectedItem) {
      leadCollectorStorage.updateProduct(selectedItem.id, payload);
      showBanner('Produto atualizado!');
    } else {
      leadCollectorStorage.addProduct(payload);
      showBanner('Produto cadastrado!');
    }
    setActiveModal(null);
    loadAll();
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Deseja excluir este produto?')) {
      leadCollectorStorage.deleteProduct(id);
      showBanner('Produto excluído.');
      loadAll();
    }
  };

  // --- LEADS ---
  const handleDeleteLead = (id: string) => {
    if (window.confirm('Tem certeza que deseja apagar este lead do banco de dados?')) {
      leadCollectorStorage.deleteLead(id);
      showBanner('Lead apagado.');
      loadAll();
    }
  };

  // --- EXCEL/CSV EXPORT ---
  const handleExportCSV = () => {
    // Columns required: Data, Evento, Nome, Telefone, Estado, Cidade, Vendedor, Empresa, Produtos, Observação, Status
    const headers = ['Data', 'Evento', 'Nome', 'Telefone', 'Estado', 'Cidade', 'Vendedor', 'Empresa', 'Produtos', 'Observacao', 'Status'];
    
    const rows = leads.map(l => {
      const date = new Date(l.createdAt).toLocaleDateString('pt-BR') + ' ' + new Date(l.createdAt).toLocaleTimeString('pt-BR');
      const productsStr = l.products.join('; ');
      
      return [
        date,
        l.eventName,
        l.fullName,
        l.phone,
        l.state,
        l.city,
        l.sellerName,
        l.companyName || 'Sem Empresa',
        productsStr,
        '', // Legacy notes field
        l.status
      ];
    });

    // Build CSV Content
    let csvContent = '\uFEFF'; // Excel BOM for UTF-8 compatibility
    csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';
    
    rows.forEach(r => {
      csvContent += r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    // Create File Download Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showBanner('Planilha CSV gerada e baixada!');
  };


  return (
    <div className="admin-container">
      {successBanner && (
        <div className="success-banner" style={{ marginBottom: '1rem' }}>
          <Check size={20} className="success-icon-check" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* ==========================================
         SUBVIEW: DASHBOARD
         ========================================== */}
      {currentTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="admin-section-header">
            <h2 className="admin-section-title">Dashboard Analítico</h2>
          </div>

          {/* Cards Grid */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-info">
                <span className="admin-stat-label">Total de Leads</span>
                <span className="admin-stat-value">{totalLeads}</span>
              </div>
              <div className="admin-stat-icon">
                <Database size={24} />
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-info">
                <span className="admin-stat-label">Leads Hoje</span>
                <span className="admin-stat-value">{leadsToday}</span>
              </div>
              <div className="admin-stat-icon" style={{ backgroundColor: '#E8FDF0', color: '#10B981' }}>
                <TrendingUp size={24} />
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-info">
                <span className="admin-stat-label">Últimos 7 dias</span>
                <span className="admin-stat-value">{leadsLast7Days}</span>
              </div>
              <div className="admin-stat-icon" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                <Calendar size={24} />
              </div>
            </div>
          </div>

          {/* Rankings Listings */}
          <div className="admin-charts-grid">
            <div className="admin-ranking-card">
              <h3 className="admin-ranking-title">Vendedores que mais captaram</h3>
              <div className="admin-ranking-list">
                {sellersRanking.length === 0 ? (
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Nenhum lead cadastrado ainda.</p>
                ) : (
                  sellersRanking.map((s, idx) => (
                    <div key={idx} className="admin-ranking-item">
                      <span className="admin-ranking-name">{s.name}</span>
                      <span className="admin-ranking-count">{s.count} leads</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="admin-ranking-card">
              <h3 className="admin-ranking-title">Eventos com mais leads</h3>
              <div className="admin-ranking-list">
                {eventsRanking.length === 0 ? (
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Nenhum lead cadastrado ainda.</p>
                ) : (
                  eventsRanking.map((e, idx) => (
                    <div key={idx} className="admin-ranking-item">
                      <span className="admin-ranking-name">{e.name}</span>
                      <span className="admin-ranking-count">{e.count} leads</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="admin-ranking-card">
              <h3 className="admin-ranking-title">Produtos mais procurados</h3>
              <div className="admin-ranking-list">
                {productsRanking.length === 0 ? (
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Nenhum lead cadastrado ainda.</p>
                ) : (
                  productsRanking.map((p, idx) => (
                    <div key={idx} className="admin-ranking-item">
                      <span className="admin-ranking-name">{p.name}</span>
                      <span className="admin-ranking-count">{p.count} consultados</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
         SUBVIEW: EVENTS CRUD
         ========================================== */}
      {currentTab === 'events' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="admin-section-header">
            <h2 className="admin-section-title">Gerenciar Eventos</h2>
            <button 
              type="button" 
              className="btn btn-primary btn-sm" 
              onClick={handleOpenAddEvent}
              style={{ width: 'auto', minHeight: '44px', height: 'auto', padding: '0 1.1rem', whiteSpace: 'nowrap' }}
            >
              <Plus size={18} />
              Novo Evento
            </button>
          </div>

          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Data</th>
                  <th>Localização</th>
                  <th>Vendedores</th>
                  <th>Produtos em Exposição</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                      Nenhum evento cadastrado.
                    </td>
                  </tr>
                ) : (
                  events.map((evt) => (
                    <tr key={evt.id}>
                      <td style={{ fontWeight: 600 }}>{evt.name}</td>
                      <td>{new Date(evt.startDate).toLocaleDateString('pt-BR')} até {new Date(evt.endDate).toLocaleDateString('pt-BR')}</td>
                      <td>{evt.location}, {evt.city} - {evt.state}</td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {evt.sellerIds && evt.sellerIds.length > 0 ? (
                          sellers
                            .filter(s => evt.sellerIds.includes(s.id))
                            .map(s => s.name)
                            .join(', ')
                        ) : (
                          <span style={{ color: 'var(--danger)' }}>Nenhum vinculado</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {evt.productIds && evt.productIds.length > 0 ? (
                          products
                            .filter(p => evt.productIds.includes(p.id))
                            .map(p => p.name)
                            .join(', ')
                        ) : (
                          <span style={{ color: 'var(--danger)' }}>Nenhum em exposição</span>
                        )}
                      </td>
                      <td>
                        <span className={`admin-badge ${
                          evt.status === 'active' ? 'admin-badge-success' : 
                          evt.status === 'future' ? 'admin-badge-warning' : 'admin-badge-danger'
                        }`}>
                          {evt.status === 'active' ? 'Ativo' : evt.status === 'future' ? 'Futuro' : 'Finalizado'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          <button 
                            type="button" 
                            className="btn btn-outline btn-sm" 
                            onClick={() => handleOpenEditEvent(evt)}
                            style={{ width: 'auto' }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-danger-light btn-sm" 
                            onClick={() => handleDeleteEvent(evt.id)}
                            style={{ width: 'auto' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
         SUBVIEW: COMPANIES CRUD
         ========================================== */}
      {currentTab === 'companies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="admin-section-header">
            <h2 className="admin-section-title">Gerenciar Empresas</h2>
            <button 
              type="button" 
              className="btn btn-primary btn-sm" 
              onClick={handleOpenAddCompany}
              style={{ width: 'auto', minHeight: '44px', height: 'auto', padding: '0 1.1rem', whiteSpace: 'nowrap' }}
            >
              <Plus size={18} />
              Nova Empresa
            </button>
          </div>

          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th>CNPJ</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {companies.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                      Nenhuma empresa cadastrada.
                    </td>
                  </tr>
                ) : (
                  companies.map((co) => (
                    <tr key={co.id}>
                      <td>{co.id}</td>
                      <td style={{ fontWeight: 600 }}>{co.name}</td>
                      <td>{co.email || '-'}</td>
                      <td>{co.phone || '-'}</td>
                      <td>{co.cnpj || '-'}</td>
                      <td>
                        <span className={`admin-badge ${co.status === 'Ativo' ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                          {co.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          <button 
                            type="button" 
                            className="btn btn-outline btn-sm" 
                            onClick={() => handleOpenEditCompany(co)}
                            style={{ width: 'auto' }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-danger-light btn-sm" 
                            onClick={() => handleDeleteCompany(co.id)}
                            style={{ width: 'auto' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
         SUBVIEW: SELLERS CRUD
         ========================================== */}
      {currentTab === 'sellers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="admin-section-header">
            <h2 className="admin-section-title">Gerenciar Vendedores</h2>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Bulk import — root_admin only */}
              {isRootAdmin(seller) && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    if (!window.confirm(
                      'Isso vai criar os vendedores Portal Lead que ainda não existem no sistema.\n\nContinuar?'
                    )) return;
                    const result = bulkCreatePortalLeadVendors();
                    loadAll();
                    showBanner(
                      `Vendedores importados! ✅ Criados: ${result.created}. Já existentes: ${result.skipped}.`
                    );
                  }}
                  style={{ whiteSpace: 'nowrap', borderColor: '#6366f1', color: '#4f46e5' }}
                  title="Disponível apenas para Root Admin"
                >
                  <Users size={16} />
                  Recriar vendedores Portal Lead
                </button>
              )}
              <button 
                type="button" 
                className="btn btn-primary btn-sm" 
                onClick={handleOpenAddSeller}
                style={{ width: 'auto', minHeight: '44px', height: 'auto', padding: '0 1.1rem', whiteSpace: 'nowrap' }}
              >
                <Plus size={18} />
                Novo Vendedor
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Usuário</th>
                  <th>E-mail</th>
                  <th>Celular</th>
                  <th>Empresa</th>
                  <th>Papel</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {sellers.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                      Nenhum vendedor cadastrado.
                    </td>
                  </tr>
                ) : (
                  sellers.map((sel) => {
                    const isRoot = isRootAdmin(sel);
                    return (
                      <tr key={sel.id} style={isRoot ? { background: 'linear-gradient(90deg, #f0f4ff 0%, #fff 100%)' } : undefined}>
                        <td style={{ fontWeight: 600 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span>{sel.name}</span>
                            {isRoot && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                  color: '#fff',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  letterSpacing: '0.05em',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}>
                                  <Shield size={8} /> ROOT ADMIN
                                </span>
                                <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Usuário protegido</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>{sel.username}</td>
                        <td>{sel.email || '-'}</td>
                        <td>{sel.phone}</td>
                        <td>{sel.companyName || 'Sem Empresa'}</td>
                        <td>
                          {isRoot ? (
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                              color: '#fff',
                              padding: '2px 8px',
                              borderRadius: '99px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Shield size={10} /> Root Admin
                            </span>
                          ) : (
                            <span className={`admin-badge ${
                              sel.role === 'root_admin' || sel.role === 'Admin' ? 'admin-badge-info' : 
                              sel.role === 'company_admin' ? 'admin-badge-info' : 'admin-badge-warning'
                            }`}>
                              {sel.role === 'vendor' || sel.role === 'Vendedor' ? 'Vendedor' :
                               sel.role === 'company_admin' ? 'Admin Empresa' : sel.role}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`admin-badge ${sel.status === 'Ativo' || sel.status === 'active' ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                            {sel.status === 'active' ? 'Ativo' : sel.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons-group">
                            <button 
                              type="button" 
                              className="btn btn-outline btn-sm" 
                              onClick={() => handleOpenEditSeller(sel)}
                              style={{ width: 'auto' }}
                              title={isRoot ? 'Editar apenas senha' : 'Editar usuário'}
                            >
                              <Edit2 size={14} />
                            </button>
                            {/* Delete button hidden for root admin */}
                            {!isRoot && (
                              <button 
                                type="button" 
                                className="btn btn-danger-light btn-sm" 
                                onClick={() => handleDeleteSeller(sel.id)}
                                style={{ width: 'auto' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
         SUBVIEW: PRODUCTS CRUD
         ========================================== */}
      {currentTab === 'products' && (() => {
        const allLines = Array.from(new Set(products.map(p => (p as any).line).filter(Boolean))).sort() as string[];
        const allCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort() as string[];
        const allBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))).sort() as string[];

        const filtered = products.filter(p => {
          const q = pfSearch.toLowerCase();
          const matchSearch = !pfSearch ||
            p.name.toLowerCase().includes(q) ||
            (p.brand || '').toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q) ||
            ((p as any).line || '').toLowerCase().includes(q);
          const matchLine = !pfLine || (p as any).line === pfLine;
          const matchCat = !pfCategory || p.category === pfCategory;
          const matchBrand = !pfBrand || p.brand === pfBrand;
          const matchStatus = !pfStatus || p.status === pfStatus;
          return matchSearch && matchLine && matchCat && matchBrand && matchStatus;
        });

        const hasFilter = !!(pfSearch || pfLine || pfCategory || pfBrand || pfStatus);

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div className="admin-section-header">
              <h2 className="admin-section-title">Gerenciar Produtos</h2>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {isRootAdmin(seller) && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={async () => {
                      try {
                        const res = await fetch('/importedProducts.json');
                        if (!res.ok) throw new Error('Arquivo não encontrado. Execute: npm run import:products');
                        const imported: any[] = await res.json();
                        const norm = (s: string) =>
                          s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
                        const existing = leadCollectorStorage.getProducts();
                        let created = 0; let updated = 0;
                        for (const imp of imported) {
                          const normName = norm(imp.name);
                          const matchedExisting = existing.find(p => norm(p.name) === normName);
                          if (matchedExisting) {
                            if (
                              matchedExisting.brand !== imp.brand ||
                              matchedExisting.category !== imp.category ||
                              (matchedExisting as any).line !== imp.line ||
                              matchedExisting.companyName !== imp.companyName
                            ) {
                              leadCollectorStorage.updateProduct(matchedExisting.id, {
                                brand: imp.brand || matchedExisting.brand || '',
                                category: imp.category || matchedExisting.category || '',
                                line: imp.line || (matchedExisting as any).line || '',
                                companyName: imp.companyName || matchedExisting.companyName || 'Comercial Scardua',
                              });
                              updated++;
                            }
                            continue;
                          }
                          leadCollectorStorage.addProduct({
                            name: imp.name, brand: imp.brand || '', category: imp.category || '',
                            line: imp.line || '', companyId: imp.companyId || null,
                            companyName: imp.companyName || 'Comercial Scardua', status: 'Ativo',
                          } as any);
                          created++;
                        }
                        loadAll();
                        showBanner(`Produtos importados! ✅ Criados: ${created}. Atualizados/Corrigidos: ${updated}.`);
                      } catch (err: any) { alert('Erro ao importar: ' + err.message); }
                    }}
                    style={{ whiteSpace: 'nowrap', borderColor: '#0891b2', color: '#0e7490' }}
                    title="Importa produtos do JSON gerado por npm run import:products"
                  >
                    <Database size={16} />
                    Importar produtos das pastas
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleOpenAddProduct}
                  style={{ width: 'auto', minHeight: '44px', height: 'auto', padding: '0 1.1rem', whiteSpace: 'nowrap' }}
                >
                  <Plus size={18} />
                  Novo Produto
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '0.75rem', background: '#fff', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <input type="text" className="form-input"
                style={{ paddingLeft: '1rem', height: '40px', minHeight: '40px', fontSize: '0.85rem' }}
                placeholder="Buscar produto..." value={pfSearch} onChange={e => setPfSearch(e.target.value)} />
              <select className="form-select" style={{ paddingLeft: '0.75rem', height: '40px', minHeight: '40px', fontSize: '0.85rem' }} value={pfLine} onChange={e => setPfLine(e.target.value)}>
                <option value="">Todas as linhas</option>
                {allLines.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <select className="form-select" style={{ paddingLeft: '0.75rem', height: '40px', minHeight: '40px', fontSize: '0.85rem' }} value={pfCategory} onChange={e => setPfCategory(e.target.value)}>
                <option value="">Todas as categorias</option>
                {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="form-select" style={{ paddingLeft: '0.75rem', height: '40px', minHeight: '40px', fontSize: '0.85rem' }} value={pfBrand} onChange={e => setPfBrand(e.target.value)}>
                <option value="">Todas as marcas</option>
                {allBrands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select className="form-select" style={{ paddingLeft: '0.75rem', height: '40px', minHeight: '40px', fontSize: '0.85rem' }} value={pfStatus} onChange={e => setPfStatus(e.target.value)}>
                <option value="">Todos os status</option>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
              {hasFilter && (
                <button type="button" className="btn btn-outline btn-sm"
                  style={{ height: '40px', minHeight: '40px', fontSize: '0.85rem' }}
                  onClick={() => { setPfSearch(''); setPfLine(''); setPfCategory(''); setPfBrand(''); setPfStatus(''); }}>
                  Limpar filtros
                </button>
              )}
            </div>

            {/* Counter */}
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>
              {hasFilter ? `Produtos encontrados: ${filtered.length} de ${products.length}` : `Produtos encontrados: ${products.length}`}
            </p>

            {/* Table */}
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Linha</th>
                    <th>Categoria</th>
                    <th>Marca</th>
                    <th>Empresa</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                        {products.length === 0 ? 'Nenhum produto cadastrado.' : 'Nenhum produto com esses filtros.'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((pr) => (
                      <tr key={pr.id}>
                        <td style={{ fontWeight: 600 }}>{pr.name}</td>
                        <td><span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{(pr as any).line || '—'}</span></td>
                        <td>{pr.category || '—'}</td>
                        <td>{pr.brand || '—'}</td>
                        <td>{pr.companyName || 'Sem Empresa'}</td>
                        <td>
                          <span className={`admin-badge ${pr.status === 'Ativo' ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                            {pr.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons-group">
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => handleOpenEditProduct(pr)} style={{ width: 'auto' }}>
                              <Edit2 size={14} />
                            </button>
                            <button type="button" className="btn btn-danger-light btn-sm" onClick={() => handleDeleteProduct(pr.id)} style={{ width: 'auto' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}


      {/* ==========================================
         SUBVIEW: LEADS VIEW AND EXPORT
         ========================================== */}
      {currentTab === 'leads' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="admin-section-header">
            <h2 className="admin-section-title">Leads Capturados</h2>
            {leads.length > 0 && (
              <button 
                type="button" 
                className="btn btn-outline btn-sm" 
                onClick={handleExportCSV}
                style={{ width: 'auto', minHeight: '44px', height: 'auto', padding: '0 1.1rem', whiteSpace: 'nowrap', borderColor: 'var(--primary)', color: 'var(--primary)' }}
              >
                <Download size={18} />
                Exportar para Excel
              </button>
            )}
          </div>

          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>Localização</th>
                  <th>Evento</th>
                  <th>Vendedor</th>
                  <th>Empresa</th>
                  <th>Produtos</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                      Nenhum lead registrado até o momento.
                    </td>
                  </tr>
                ) : (
                  leads.map((l) => {
                    const dateStr = new Date(l.createdAt).toLocaleDateString('pt-BR') + ' ' + new Date(l.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
                    return (
                      <tr key={l.id}>
                        <td style={{ fontWeight: 600 }}>{l.fullName}</td>
                        <td>{l.phone}</td>
                        <td>{l.city} - {l.state}</td>
                        <td>{l.eventName}</td>
                        <td>{l.sellerName}</td>
                        <td>{l.companyName || 'Sem Empresa'}</td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {l.products.join(', ')}
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{dateStr}</td>
                        <td>
                          <span className="admin-badge admin-badge-success">
                            {l.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            type="button" 
                            className="btn btn-danger-light btn-sm" 
                            onClick={() => handleDeleteLead(l.id)}
                            style={{ width: 'auto' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* ==========================================
         FORM MODALS SHEETS (OVERLAY FOR CRUDS)
         ========================================== */}
      {activeModal && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)} style={{ position: 'fixed', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <header className="admin-modal-header">
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {selectedItem ? 'Editar' : 'Adicionar'}{' '}
                {activeModal === 'event' ? 'Evento' : 
                 activeModal === 'company' ? 'Empresa' : 
                 activeModal === 'seller' ? 'Vendedor' : 'Produto'}
              </span>
              <button 
                type="button" 
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
                onClick={() => setActiveModal(null)}
              >
                <X size={20} />
              </button>
            </header>

            {/* EVENT FORM MODAL */}
            {activeModal === 'event' && (
              <form onSubmit={handleSaveEvent}>
                <div className="admin-modal-body">
                  {modalError && (
                    <div className="error-message" style={{ marginBottom: '0.5rem' }}>
                      <AlertCircle size={16} />
                      {modalError}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Nome do Evento *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ paddingLeft: '1rem', height: '46px' }}
                      placeholder="Ex: Feira de Teixeira 2026" 
                      value={evName} 
                      onChange={e => setEvName(e.target.value)} 
                    />
                  </div>

                  <div className="modal-2col-grid">
                    <div className="form-group">
                      <label className="form-label">Data de Início *</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        style={{ paddingLeft: '1rem', height: '46px' }}
                        value={evStartDate} 
                        onChange={e => setEvStartDate(e.target.value)} 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Data de Término *</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        style={{ paddingLeft: '1rem', height: '46px' }}
                        value={evEndDate} 
                        onChange={e => setEvEndDate(e.target.value)} 
                      />
                    </div>
                  </div>

                  {/* Estado — IBGE */}
                  <div className="form-group">
                    <label className="form-label">Estado *</label>
                    <select
                      className="form-select"
                      style={{ paddingLeft: '1rem', height: '46px' }}
                      value={evStateUf}
                      onChange={handleEvStateChange}
                    >
                      <option value="">Selecione o estado...</option>
                      {states.map(s => (
                        <option key={s.uf} value={s.uf}>{s.name} ({s.uf})</option>
                      ))}
                    </select>
                  </div>

                  {/* Cidade — autocomplete IBGE */}
                  <div className="form-group">
                    <label className="form-label">Cidade *</label>
                    <div ref={evDropdownRef} className="city-autocomplete-wrapper">
                      <input
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: '1rem', height: '46px' }}
                        placeholder={evStateUf ? (evCitiesLoading ? 'Carregando cidades...' : 'Digite para buscar a cidade...') : 'Selecione o estado primeiro'}
                        value={evCity}
                        disabled={!evStateUf || evCitiesLoading}
                        onChange={handleEvCityInputChange}
                        onFocus={() => evStateUf && setShowEvCitiesDropdown(true)}
                        autoComplete="off"
                      />
                      {evCitiesLoading && (
                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '0.8rem' }}>
                          Carregando...
                        </div>
                      )}
                      {showEvCitiesDropdown && filteredEvCities.length > 0 && (
                        <div className="city-options-list">
                          {filteredEvCities.map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleEvSelectCity(c)}
                              className="city-option"
                            >
                              {c.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {evIbgeError && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--warning, #D97706)', marginTop: '4px' }}>
                        ⚠️ {evIbgeError}
                      </p>
                    )}
                    {evCityId && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--success, #10B981)', marginTop: '4px' }}>
                        ✓ Cidade oficial IBGE selecionada
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Endereço/Localização *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ paddingLeft: '1rem', height: '46px' }}
                      placeholder="Ex: Pavilhão de Exposições Centro" 
                      value={evLocation} 
                      onChange={e => setEvLocation(e.target.value)} 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Descrição</label>
                    <textarea 
                      className="form-input" 
                      style={{ paddingLeft: '1rem', height: '80px', paddingTop: '0.5rem', resize: 'none' }}
                      placeholder="Detalhes adicionais do evento..." 
                      value={evDescription} 
                      onChange={e => setEvDescription(e.target.value)} 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status do Evento</label>
                    <select
                      className="form-select"
                      style={{ paddingLeft: '1rem', height: '46px' }}
                      value={evStatus}
                      onChange={e => setEvStatus(e.target.value as any)}
                    >
                      <option value="active">Ativo (Em Andamento)</option>
                      <option value="future">Futuro (Agendado)</option>
                      <option value="completed">Finalizado</option>
                    </select>
                  </div>

                  {/* Association checkbox grids */}
                  <div className="form-group">
                    <label className="form-label">Vendedores que Atenderão</label>
                    <div className="admin-selection-list">
                      {sellers.filter(s => isVendor(s)).map(s => (
                        <label key={s.id} className="admin-selection-item">
                          <input 
                            type="checkbox" 
                            checked={evSellerIds.includes(s.id)}
                            onChange={(e) => {
                              if (e.target.checked) setEvSellerIds([...evSellerIds, s.id]);
                              else setEvSellerIds(evSellerIds.filter(id => id !== s.id));
                            }}
                          />
                          <span>{s.name} ({s.companyName})</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Produtos em Exposição</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '1rem', height: '38px', minHeight: '38px', fontSize: '0.85rem', marginBottom: '0.5rem' }}
                      placeholder="Buscar produto para vincular..."
                      value={evProductSearch}
                      onChange={e => setEvProductSearch(e.target.value)}
                    />
                    <div className="admin-selection-list">
                      {products
                        .filter(p => !evProductSearch || p.name.toLowerCase().includes(evProductSearch.toLowerCase()) || (p.category || '').toLowerCase().includes(evProductSearch.toLowerCase()) || ((p as any).line || '').toLowerCase().includes(evProductSearch.toLowerCase()))
                        .map(p => (
                          <label key={p.id} className="admin-selection-item">
                            <input
                              type="checkbox"
                              checked={evProductIds.includes(p.id)}
                              onChange={(e) => {
                                if (e.target.checked) setEvProductIds([...evProductIds, p.id]);
                                else setEvProductIds(evProductIds.filter(id => id !== p.id));
                              }}
                            />
                            <span>
                              {p.name}
                              {(p as any).line && <span style={{ fontSize: '0.72rem', color: 'var(--muted)', marginLeft: '0.4rem' }}>· {(p as any).line}</span>}
                            </span>
                          </label>
                        ))}
                    </div>
                    {evProductIds.length > 0 && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.35rem' }}>
                        ✓ {evProductIds.length} produto(s) selecionado(s)
                      </p>
                    )}
                  </div>
                </div>

                <footer className="admin-modal-footer">
                  <button type="button" className="btn btn-outline btn-sm" style={{ width: 'auto' }} onClick={() => setActiveModal(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ width: 'auto' }}>Salvar Evento</button>
                </footer>
              </form>
            )}

            {/* COMPANY FORM MODAL */}
            {activeModal === 'company' && (
              <form onSubmit={handleSaveCompany}>
                <div className="admin-modal-body">
                  {modalError && (
                    <div className="error-message" style={{ marginBottom: '0.5rem' }}>
                      <AlertCircle size={16} />
                      {modalError}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Nome da Empresa *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ paddingLeft: '1rem', height: '46px' }}
                      placeholder="Ex: Traçãofort" 
                      value={coName} 
                      onChange={e => setCoName(e.target.value)} 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">E-mail corporativo</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      style={{ paddingLeft: '1rem', height: '46px' }}
                      placeholder="Ex: contato@empresa.com" 
                      value={coEmail} 
                      onChange={e => setCoEmail(e.target.value)} 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Telefone de Contato</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ paddingLeft: '1rem', height: '46px' }}
                      placeholder="Ex: (27) 3333-4444" 
                      value={coPhone} 
                      onChange={e => setCoPhone(e.target.value)} 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">CNPJ</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ paddingLeft: '1rem', height: '46px' }}
                      placeholder="Ex: 00.000.000/0001-00" 
                      value={coCnpj} 
                      onChange={e => setCoCnpj(e.target.value)} 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      style={{ paddingLeft: '1rem', height: '46px' }}
                      value={coStatus}
                      onChange={e => setCoStatus(e.target.value as any)}
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                  </div>
                </div>

                <footer className="admin-modal-footer">
                  <button type="button" className="btn btn-outline btn-sm" style={{ width: 'auto' }} onClick={() => setActiveModal(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ width: 'auto' }}>Salvar Empresa</button>
                </footer>
              </form>
            )}

            {/* SELLER FORM MODAL */}
            {activeModal === 'seller' && (() => {
              const editingRootAdmin = !!(selectedItem && isRootAdmin(selectedItem));
              return (
                <form onSubmit={handleSaveSeller}>
                  <div className="admin-modal-body">
                    {modalError && (
                      <div className="error-message" style={{ marginBottom: '0.5rem' }}>
                        <AlertCircle size={16} />
                        {modalError}
                      </div>
                    )}

                    {/* Root Admin protection notice */}
                    {editingRootAdmin && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.6rem',
                        background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)',
                        border: '1px solid #c7d2fe',
                        borderRadius: '10px',
                        padding: '0.85rem 1rem',
                        marginBottom: '1rem'
                      }}>
                        <Shield size={18} style={{ color: '#4f46e5', marginTop: '1px', flexShrink: 0 }} />
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#3730a3', margin: 0 }}>
                            Usuário Root Admin — Campos Protegidos
                          </p>
                          <p style={{ fontSize: '0.8rem', color: '#4338ca', margin: '4px 0 0' }}>
                            O administrador principal não pode ter e-mail, papel, empresa ou status alterados.
                            Apenas a <strong>senha</strong> pode ser trocada.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">Nome Completo</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        style={{ paddingLeft: '1rem', height: '46px', opacity: editingRootAdmin ? 0.5 : 1 }}
                        placeholder="Ex: Mateus dos Santos" 
                        value={seName} 
                        onChange={e => setSeName(e.target.value)}
                        disabled={editingRootAdmin}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Nome de Usuário (Login)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        style={{ paddingLeft: '1rem', height: '46px', opacity: editingRootAdmin || !!selectedItem ? 0.5 : 1 }}
                        placeholder="Ex: mateus.santos" 
                        value={seUsername} 
                        onChange={e => setSeUsername(e.target.value)}
                        disabled={editingRootAdmin || !!selectedItem}
                      />
                    </div>

                    <div className="modal-2col-grid">
                      <div className="form-group">
                        <label className="form-label">E-mail</label>
                        <input 
                          type="email" 
                          className="form-input" 
                          style={{ paddingLeft: '1rem', height: '46px', opacity: editingRootAdmin ? 0.5 : 1 }}
                          placeholder="Ex: mateus@email.com" 
                          value={seEmail} 
                          onChange={e => setSeEmail(e.target.value)}
                          disabled={editingRootAdmin}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Celular</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          style={{ paddingLeft: '1rem', height: '46px', opacity: editingRootAdmin ? 0.5 : 1 }}
                          placeholder="Ex: 27999998888" 
                          value={sePhone} 
                          onChange={e => setSePhone(e.target.value)}
                          disabled={editingRootAdmin}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ color: editingRootAdmin ? '#4f46e5' : undefined, fontWeight: editingRootAdmin ? 700 : undefined }}>
                        {editingRootAdmin ? '🔑 Nova Senha (único campo editável)' : 'Senha de Acesso *'}
                      </label>
                      <input 
                        type="password" 
                        className="form-input" 
                        style={{ paddingLeft: '1rem', height: '46px', borderColor: editingRootAdmin ? '#6366f1' : undefined }}
                        placeholder={editingRootAdmin ? 'Digite a nova senha...' : 'Senha do usuário'} 
                        value={sePassword} 
                        onChange={e => setSePassword(e.target.value)} 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Empresa Vinculada</label>
                      <select
                        className="form-select"
                        style={{ paddingLeft: '1rem', height: '46px', opacity: editingRootAdmin ? 0.5 : 1 }}
                        value={seCompanyId}
                        onChange={e => setSeCompanyId(e.target.value)}
                        disabled={editingRootAdmin}
                      >
                        <option value="">Sem Empresa / Todas</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>

                    <div className="modal-2col-grid">
                      <div className="form-group">
                        <label className="form-label">Papel (Acesso)</label>
                        <select
                          className="form-select"
                          style={{ paddingLeft: '1rem', height: '46px', opacity: editingRootAdmin ? 0.5 : 1 }}
                          value={seRole}
                          onChange={e => setSeRole(e.target.value as any)}
                          disabled={editingRootAdmin}
                        >
                          <option value="vendor">Vendedor</option>
                          <option value="company_admin">Admin de Empresa</option>
                          {editingRootAdmin && <option value="root_admin">Root Admin</option>}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          style={{ paddingLeft: '1rem', height: '46px', opacity: editingRootAdmin ? 0.5 : 1 }}
                          value={seStatus}
                          onChange={e => setSeStatus(e.target.value as any)}
                          disabled={editingRootAdmin}
                        >
                          <option value="Ativo">Ativo</option>
                          <option value="Inativo">Inativo</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <footer className="admin-modal-footer">
                    <button type="button" className="btn btn-outline btn-sm" style={{ width: 'auto' }} onClick={() => setActiveModal(null)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary btn-sm" style={{ width: 'auto' }}>
                      {editingRootAdmin ? 'Salvar Nova Senha' : 'Salvar Usuário'}
                    </button>
                  </footer>
                </form>
              );
            })()}

            {/* PRODUCT FORM MODAL */}
            {activeModal === 'product' && (
              <form onSubmit={handleSaveProduct}>
                <div className="admin-modal-body">
                  {modalError && (
                    <div className="error-message" style={{ marginBottom: '0.5rem' }}>
                      <AlertCircle size={16} />
                      {modalError}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Nome do Produto *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ paddingLeft: '1rem', height: '46px' }}
                      placeholder="Ex: YTO ESK305" 
                      value={prName} 
                      onChange={e => {
                        const val = e.target.value;
                        setPrName(val);
                        const valNorm = val.trim().toUpperCase();
                        if (valNorm.startsWith('SWE') || valNorm.startsWith('SWL')) {
                          setPrBrand('Sunward');
                        }
                      }} 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Empresa Vinculada</label>
                    <select
                      className="form-select"
                      style={{ paddingLeft: '1rem', height: '46px' }}
                      value={prCompanyId}
                      onChange={e => setPrCompanyId(e.target.value)}
                    >
                      <option value="">Sem Empresa</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="modal-2col-grid">
                    <div className="form-group">
                      <label className="form-label">Marca</label>
                      <select
                        className="form-select"
                        style={{ paddingLeft: '1rem', height: '46px' }}
                        value={prBrand}
                        onChange={e => setPrBrand(e.target.value)}
                      >
                        <option value="">Selecione a marca</option>
                        <option value="Agritech">Agritech</option>
                        <option value="Sunward">Sunward</option>
                        <option value="Moldemaq">Moldemaq</option>
                        <option value="YTO">YTO</option>
                        <option value="Barbieri">Barbieri</option>
                        <option value="Mercury">Mercury</option>
                        <option value="Fibrafort">Fibrafort</option>
                        <option value="Ventura">Ventura</option>
                        <option value="Comercial Scardua">Comercial Scardua</option>
                        <option value="Porto Livre">Porto Livre</option>
                        <option value="Outras">Outras</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Categoria</label>
                      <select
                        className="form-select"
                        style={{ paddingLeft: '1rem', height: '46px' }}
                        value={prCategory}
                        onChange={e => setPrCategory(e.target.value)}
                      >
                        <option value="">Selecione a categoria</option>
                        <option value="Trator">Trator</option>
                        <option value="Microtrator">Microtrator</option>
                        <option value="Transportador Agrícola">Transportador Agrícola</option>
                        <option value="Escavadeira">Escavadeira</option>
                        <option value="Mini Escavadeira">Mini Escavadeira</option>
                        <option value="Pá Carregadeira">Pá Carregadeira</option>
                        <option value="Rolo Compactador">Rolo Compactador</option>
                        <option value="Retroescavadeira">Retroescavadeira</option>
                        <option value="Barco">Barco</option>
                        <option value="Motor">Motor</option>
                        <option value="Jet Ski">Jet Ski</option>
                        <option value="Quadriciclo">Quadriciclo</option>
                        <option value="Peças">Peças</option>
                        <option value="Serviço">Serviço</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>
                  </div>

                  <div className="modal-2col-grid">
                    <div className="form-group">
                      <label className="form-label">Linha</label>
                      <select
                        className="form-select"
                        style={{ paddingLeft: '1rem', height: '46px' }}
                        value={prLine}
                        onChange={e => setPrLine(e.target.value)}
                      >
                        <option value="">Selecione a linha</option>
                        <option value="Linha Agrícola">Linha Agrícola</option>
                        <option value="Linha Amarela">Linha Amarela</option>
                        <option value="Linha Náutica">Linha Náutica</option>
                        <option value="Porto Livre">Porto Livre</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        style={{ paddingLeft: '1rem', height: '46px' }}
                        value={prStatus}
                        onChange={e => setPrStatus(e.target.value as any)}
                      >
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                      </select>
                    </div>
                  </div>
                </div>

                <footer className="admin-modal-footer">
                  <button type="button" className="btn btn-outline btn-sm" style={{ width: 'auto' }} onClick={() => setActiveModal(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ width: 'auto' }}>Salvar Produto</button>
                </footer>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
