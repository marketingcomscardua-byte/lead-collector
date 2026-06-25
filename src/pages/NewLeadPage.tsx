import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Phone, MapPin, Send, Calendar, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { Seller } from '../types/seller';
import { Event } from '../types/event';
import { Product } from '../types/product';
import { FormInput } from '../components/FormInput';
import { SelectField } from '../components/SelectField';
import { ProductSelector } from '../components/ProductSelector';
import { SupportFooter } from '../components/SupportFooter';
import { dataProvider } from '../services/dataProvider';
import { maskPhone } from '../utils/phoneMask';
import { isDuplicateLead } from '../utils/validators';
import { 
  getBrazilianStates, 
  getBrazilianCitiesByState, 
  BrazilianState, 
  BrazilianCity 
} from '../services/ibgeLocations';
import { BRAZIL_STATES_FALLBACK } from '../data/brazilLocationsFallback';

interface NewLeadPageProps {
  seller: Seller;
  onOpenProfile: () => void;
}

export const NewLeadPage: React.FC<NewLeadPageProps> = ({ seller }) => {
  // Lists from storage
  const [events, setEvents] = useState<Event[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // IBGE states & cities loading states
  const [states, setStates] = useState<BrazilianState[]>([]);
  const [cities, setCities] = useState<BrazilianCity[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [ibgeError, setIbgeError] = useState('');
  
  // Form states
  const [eventId, setEventId] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [stateUf, setStateUf] = useState('');
  const [city, setCity] = useState('');
  const [cityId, setCityId] = useState<number | null>(null);
  const [cityQuery, setCityQuery] = useState('');
  const [showCitiesDropdown, setShowCitiesDropdown] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Feedback states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Dropdown ref for closing on outside click
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCitiesDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const evs = await dataProvider.getEvents();
        const prods = await dataProvider.getProducts();
        setEvents(evs);
        setProducts(prods);

        // Preselect active event if available and seller is linked
        const activeEvent = evs.find(
          e => e.status === 'active' && e.sellerIds && e.sellerIds.includes(seller.id)
        );
        if (activeEvent) {
          setEventId(activeEvent.id);
        }
      } catch (err) {
        console.error("Error loading lead page data:", err);
      }
    };
    loadInitialData();

    // Load states
    async function loadStates() {
      try {
        const fetched = await getBrazilianStates();
        setStates(fetched);
      } catch {
        setStates(BRAZIL_STATES_FALLBACK);
      }
    }
    loadStates();
  }, [seller.id]);

  // Map states for SelectField
  const stateOptions = useMemo(() => {
    return states.map(s => ({ value: s.uf, label: s.name }));
  }, [states]);

  // Filter events linked to this seller
  const filteredEvents = useMemo(() => {
    return events.filter(e => e.sellerIds && e.sellerIds.includes(seller.id));
  }, [events, seller.id]);

  // Filter products linked to the selected event
  const filteredProducts = useMemo(() => {
    if (!eventId) return [];
    const selectedEvent = events.find(e => e.id === eventId);
    if (!selectedEvent || !selectedEvent.productIds) return [];

    return products.filter(
      p => selectedEvent.productIds.includes(p.id) && p.status === 'Ativo'
    );
  }, [eventId, events, products]);

  const filteredProductNames = useMemo(() => {
    return filteredProducts.map(p => p.name);
  }, [filteredProducts]);

  // Handle phone changes with mask
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskPhone(e.target.value);
    setPhone(masked);
  };

  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUf = e.target.value;
    const stateObj = states.find(s => s.uf === selectedUf);

    if (stateObj) {
      setState(stateObj.name);
      setStateUf(stateObj.uf);
    } else {
      setState('');
      setStateUf('');
    }

    setCity('');
    setCityQuery('');
    setCityId(null);
    setCities([]);
    setShowCitiesDropdown(false);
    setIbgeError('');

    if (selectedUf) {
      setCitiesLoading(true);
      try {
        const fetchedCities = await getBrazilianCitiesByState(selectedUf);
        setCities(fetchedCities);
      } catch {
        setIbgeError('Não foi possível carregar cidades pelo IBGE agora. Você pode digitar a cidade manualmente.');
      } finally {
        setCitiesLoading(false);
      }
    }
  };

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCity(val);
    setCityQuery(val);

    const exactMatch = cities.find(c => c.name.toLowerCase() === val.trim().toLowerCase());
    if (exactMatch) {
      setCityId(exactMatch.id);
    } else {
      setCityId(null);
    }
    setShowCitiesDropdown(true);
  };

  const handleSelectCity = (c: BrazilianCity) => {
    setCity(c.name);
    setCityQuery(c.name);
    setCityId(c.id);
    setShowCitiesDropdown(false);

    if (errors.city) {
      setErrors(prev => ({ ...prev, city: '' }));
    }
  };

  // Filter cities by query in dropdown
  const filteredCities = useMemo(() => {
    if (!cityQuery.trim()) return cities.slice(0, 100); // Limit initial view
    return cities.filter(c => 
      c.name.toLowerCase().includes(cityQuery.toLowerCase())
    ).slice(0, 100);
  }, [cities, cityQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrors({});

    const cleanPhone = phone.replace(/\D/g, '');
    let isDuplicate = false;

    if (eventId && phone.trim() && cleanPhone.length >= 10) {
      try {
        const allLeads = await dataProvider.getLeads();
        isDuplicate = isDuplicateLead(
          allLeads.map((l) => ({ ...l, name: l.fullName } as any)),
          phone,
          eventId
        );
      } catch (err) {
        console.error("Error checking duplicate:", err);
      }
    }

    const newErrors: Record<string, string> = {};

    if (!eventId) {
      newErrors.eventId = 'Selecione um evento.';
    }
    if (!fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório.';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório.';
    } else if (cleanPhone.length < 10) {
      newErrors.phone = 'Insira um telefone válido com DDD.';
    } else if (isDuplicate) {
      newErrors.phone = 'Este telefone já foi cadastrado para este evento.';
    }
    if (!stateUf) {
      newErrors.state = 'Selecione um estado.';
    }
    if (!city.trim()) {
      newErrors.city = 'Selecione ou digite uma cidade.';
    }
    if (selectedProducts.length === 0) {
      newErrors.products = 'Selecione pelo menos um produto.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Find event details
    const selectedEvent = events.find(e => e.id === eventId);
    
    try {
      // Save lead
      await dataProvider.addLead({
        eventId,
        eventName: selectedEvent ? selectedEvent.name : '',
        sellerId: seller.id,
        sellerName: seller.name,
        companyId: seller.companyId || '',
        companyName: seller.companyName || 'Sem Empresa',
        fullName,
        phone,
        state,
        stateUf,
        city,
        cityId,
        products: selectedProducts
      });

      // Show success message
      setSuccessMessage('Lead registrado com sucesso!');
      
      // Reset inputs but KEEP event and state for convenience in events
      setFullName('');
      setPhone('');
      setCity('');
      setCityQuery('');
      setCityId(null);
      setSelectedProducts([]);
      setErrors({});

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error("Error saving lead:", err);
      setErrors({ global: 'Não foi possível salvar o lead. Tente novamente.' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {successMessage && (
        <div className="success-banner" style={{ margin: '0 0.5rem' }}>
          <CheckCircle size={20} className="success-icon-check" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        
        <div className="card-header">
          <h2 className="card-title">Novo Lead</h2>
          <p className="card-subtitle">Preencha os dados do cliente potencial</p>
        </div>

        {/* Current Event Selection Block */}
        <div className="event-highlight">
          <div className="event-label-row">
            <Calendar size={16} />
            <span>EVENTO ATUAL</span>
          </div>
          
          <div className="select-wrapper">
            <Calendar className="input-icon" />
            <select
              id="lead-event"
              className={`form-select ${errors.eventId ? 'error' : ''}`}
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
            >
              <option value="">Selecione o Evento...</option>
              {filteredEvents.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.city} - {e.stateUf || e.state})
                </option>
              ))}
            </select>
            <ChevronDown className="select-arrow" />
          </div>
          {errors.eventId && (
            <span className="error-message">
              <AlertCircle size={14} />
              {errors.eventId}
            </span>
          )}
        </div>

        {/* Lead Identity Fields */}
        <FormInput
          label="Nome Completo *"
          id="lead-name"
          type="text"
          icon={User}
          placeholder="Ex: João Silva"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
        />

        <FormInput
          label="Telefone *"
          id="lead-phone"
          type="tel"
          icon={Phone}
          placeholder="(27) 99999-9999"
          value={phone}
          onChange={handlePhoneChange}
          error={errors.phone}
        />

        {/* Localization Section */}
        <div className="flex-col gap-2" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <div className="flex align-center gap-2" style={{ color: 'var(--primary-dark)', fontWeight: 700, fontSize: '0.95rem' }}>
            <MapPin size={18} />
            <span>Localização</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            <SelectField
              label="Estado *"
              id="lead-state"
              icon={MapPin}
              value={stateUf}
              onChange={handleStateChange}
              placeholderOption="Selecione o estado..."
              options={stateOptions}
              error={errors.state}
            />

            {/* Custom logic for Autocomplete/Searchable Cidade input */}
            <div className="form-group city-autocomplete-wrapper" ref={dropdownRef}>
              <label htmlFor="lead-city" className="form-label">
                Cidade *
              </label>
              
              {ibgeError && (
                <div className="error-message" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '4px', fontSize: '0.8rem', color: '#b45309', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '6px 10px', borderRadius: '6px' }}>
                  <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{ibgeError}</span>
                </div>
              )}

              <div className="select-wrapper">
                <MapPin className="input-icon" />
                
                <input
                  id="lead-city"
                  type="text"
                  className={`form-input ${errors.city ? 'error' : ''}`}
                  placeholder={
                    !stateUf 
                      ? "Selecione o estado primeiro" 
                      : citiesLoading 
                        ? "Carregando cidades..." 
                        : "Digite ou selecione a cidade..."
                  }
                  value={city}
                  onChange={handleCityInputChange}
                  onFocus={() => {
                    if (stateUf && !citiesLoading) {
                      setShowCitiesDropdown(true);
                    }
                  }}
                  disabled={!stateUf || citiesLoading}
                  autoComplete="off"
                />

                {citiesLoading && (
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--muted)' }}>
                    Carregando...
                  </span>
                )}
              </div>

              {/* Autocomplete Dropdown List */}
              {showCitiesDropdown && stateUf && !citiesLoading && filteredCities.length > 0 && (
                <div className="city-options-list">
                  {filteredCities.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCity(c)}
                      className="city-option"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}

              {errors.city && (
                <span className="error-message">
                  <AlertCircle size={14} />
                  {errors.city}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Product selector */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <ProductSelector
            products={filteredProductNames}
            selectedProducts={selectedProducts}
            onChange={setSelectedProducts}
            error={errors.products}
          />
        </div>

        {/* Submit */}
        <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1rem' }}>
          <Send size={18} />
          Registrar Lead
        </button>

      </form>

      {/* support footer */}
      <SupportFooter />
    </div>
  );
};
