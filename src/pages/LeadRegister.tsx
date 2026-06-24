import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus } from '../types/lead';
import { Event } from '../types/event';
import { Seller } from '../types/seller';
import { Product } from '../types/product';
import { maskPhone, unmaskPhone } from '../utils/phoneMask';
import { validatePhone, isDuplicateLead } from '../utils/validators';
import { Save, AlertCircle, CheckCircle2, UserPlus, ShieldAlert } from 'lucide-react';

interface LeadRegisterProps {
  leads: Lead[];
  events: Event[];
  sellers: Seller[];
  products: Product[];
  activeEventId: string;
  activeSellerId: string;
  onAddLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onNavigate: (page: string) => void;
}

const ES_CITIES = [
  'Vila Velha',
  'Serra',
  'Vitória',
  'Cariacica',
  'Linhares',
  'Colatina',
  'Guarapari',
  'Cachoeiro de Itapemirim',
  'São Mateus',
  'Viana',
  'Aracruz',
  'Marataízes',
  'Nova Venécia',
  'Outra (Digitar)'
];

export const LeadRegister: React.FC<LeadRegisterProps> = ({
  leads,
  events,
  sellers,
  products,
  activeEventId,
  activeSellerId,
  onAddLead,
  onNavigate
}) => {
  // Form State
  const [eventId, setEventId] = useState(activeEventId);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('ES');
  const [citySelect, setCitySelect] = useState('Vila Velha');
  const [customCity, setCustomCity] = useState('');
  const [sellerId, setSellerId] = useState(activeSellerId);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<LeadStatus>('novo');

  // Feedback State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Sync with active settings on load or change
  useEffect(() => {
    if (activeEventId) setEventId(activeEventId);
    if (activeSellerId) setSellerId(activeSellerId);
  }, [activeEventId, activeSellerId]);

  // Handle phone changes and mask
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskPhone(e.target.value);
    setPhone(masked);

    // Dynamic duplicate checking
    const hasWarning = isDuplicateLead(leads, masked, eventId);
    setDuplicateWarning(hasWarning);

    // Clear phone errors
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  // Toggle products
  const handleProductToggle = (productId: string) => {
    setSelectedProductIds(prev => {
      const idx = prev.indexOf(productId);
      const updated = idx === -1 
        ? [...prev, productId] 
        : prev.filter(id => id !== productId);

      if (updated.length > 0 && errors.products) {
        setErrors(err => ({ ...err, products: '' }));
      }
      return updated;
    });
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'O nome completo é obrigatório.';
    if (!phone) {
      newErrors.phone = 'O telefone é obrigatório.';
    } else if (!validatePhone(phone)) {
      newErrors.phone = 'Digite um telefone válido com DDD (10 ou 11 dígitos).';
    }
    if (!eventId) newErrors.eventId = 'Selecione o evento.';
    if (!sellerId) newErrors.sellerId = 'Selecione o vendedor.';
    if (selectedProductIds.length === 0) {
      newErrors.products = 'Selecione ao menos um produto de interesse.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to top or first error on mobile
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const finalCity = citySelect === 'Outra (Digitar)' ? customCity : citySelect;

    onAddLead({
      eventId,
      name: name.trim(),
      phone: phone.trim(),
      state,
      city: finalCity.trim() || 'Não informada',
      sellerId,
      productIds: selectedProductIds,
      notes: notes.trim(),
      status,
      source: 'event/app'
    });

    // Show success
    setSuccessMsg(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Reset Form (keep config settings)
    setName('');
    setPhone('');
    setSelectedProductIds([]);
    setNotes('');
    setStatus('novo');
    setErrors({});
    setDuplicateWarning(false);

    // Hide success after 4s
    setTimeout(() => {
      setSuccessMsg(false);
    }, 4000);
  };

  // Quick select active event/seller if config is empty
  const activeEventObj = events.find(e => e.id === eventId);

  return (
    <div className="lead-register-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Registrar Novo Lead</h2>
          <p className="page-subtitle">Captura rápida de dados no local do evento</p>
        </div>
      </div>

      {successMsg && (
        <div className="alert-banner success mb-4">
          <CheckCircle2 size={22} />
          <div>
            <span className="alert-title">Lead Salvo com Sucesso!</span>
            <p className="alert-desc">Os dados do cliente foram salvos no dispositivo.</p>
          </div>
        </div>
      )}

      {duplicateWarning && (
        <div className="alert-banner warning mb-4">
          <ShieldAlert size={22} />
          <div>
            <span className="alert-title">Aviso de Lead Duplicado</span>
            <p className="alert-desc">Já existe um lead cadastrado com este telefone para este evento.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card lead-form-card">
        {/* Event & Seller Context (Compact header) */}
        <div className="form-section-header">
          <span>Identificação do Evento</span>
        </div>

        <div className="grid-cols-2 mb-4">
          <div className="form-group">
            <label className="form-label">Evento *</label>
            <select
              value={eventId}
              onChange={(e) => {
                setEventId(e.target.value);
                setDuplicateWarning(isDuplicateLead(leads, phone, e.target.value));
              }}
              className={`form-control ${errors.eventId ? 'error' : ''}`}
            >
              <option value="">-- Selecione o Evento --</option>
              {events.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.location})</option>
              ))}
            </select>
            {errors.eventId && <span className="form-error">{errors.eventId}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Vendedor Responsável *</label>
            <select
              value={sellerId}
              onChange={(e) => setSellerId(e.target.value)}
              className={`form-control ${errors.sellerId ? 'error' : ''}`}
            >
              <option value="">-- Selecione o Vendedor --</option>
              {sellers.filter(s => s.isActive || s.id === sellerId).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.sellerId && <span className="form-error">{errors.sellerId}</span>}
          </div>
        </div>

        {/* Lead Personal Information */}
        <div className="form-section-header">
          <span>Dados do Cliente</span>
        </div>

        <div className="form-group">
          <label className="form-label">Nome Completo *</label>
          <input
            type="text"
            placeholder="Digite o nome completo do lead"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
            }}
            className={`form-control ${errors.name ? 'error' : ''}`}
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="grid-cols-3 mb-2">
          <div className="form-group col-span-2">
            <label className="form-label">Telefone / WhatsApp *</label>
            <input
              type="tel"
              placeholder="(00) 00000-0000"
              value={phone}
              onChange={handlePhoneChange}
              className={`form-control ${errors.phone ? 'error' : ''}`}
            />
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Estado</label>
            <select 
              value={state} 
              onChange={(e) => setState(e.target.value)}
              className="form-control"
            >
              <option value="ES">Espírito Santo (ES)</option>
              <option value="MG">Minas Gerais (MG)</option>
              <option value="BA">Bahia (BA)</option>
              <option value="RJ">Rio de Janeiro (RJ)</option>
              <option value="SP">São Paulo (SP)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Cidade</label>
          <div className="city-input-group">
            <select
              value={citySelect}
              onChange={(e) => setCitySelect(e.target.value)}
              className="form-control"
              style={{ flex: 1 }}
            >
              {ES_CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            
            {citySelect === 'Outra (Digitar)' && (
              <input
                type="text"
                placeholder="Digite a cidade"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                className="form-control"
                style={{ flex: 1 }}
              />
            )}
          </div>
        </div>

        {/* Products of Interest */}
        <div className="form-section-header">
          <span>Produtos de Interesse *</span>
          {errors.products && <span className="form-error" style={{ margin: 0, float: 'right' }}>{errors.products}</span>}
        </div>

        <div className="products-tag-selector">
          {products.filter(p => p.isActive).map(product => {
            const isSelected = selectedProductIds.includes(product.id);
            return (
              <button
                type="button"
                key={product.id}
                onClick={() => handleProductToggle(product.id)}
                className={`tag-btn ${isSelected ? 'active' : ''}`}
              >
                <span className="tag-brand">{product.brand}</span>
                <span className="tag-name">{product.name}</span>
              </button>
            );
          })}
        </div>

        {/* Additional Details */}
        <div className="form-section-header">
          <span>Informações de Atendimento</span>
        </div>

        <div className="grid-cols-2 mb-2">
          <div className="form-group">
            <label className="form-label">Status Inicial</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
              className="form-control"
            >
              <option value="novo">Novo</option>
              <option value="em_atendimento">Em atendimento</option>
              <option value="interessado">Interessado</option>
              <option value="sem_retorno">Sem retorno</option>
              <option value="convertido">Convertido</option>
              <option value="perdido">Perdido</option>
            </select>
          </div>
          <div className="form-group">
            {/* Display active context to confirm */}
            <label className="form-label" style={{ opacity: 0.7 }}>Resumo de Envio</label>
            <div className="info-display">
              <span>Origem: <strong>Feiras / Aplicativo</strong></span>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Observações / Detalhes da Negociação</label>
          <textarea
            rows={3}
            placeholder="Digite detalhes do interesse, modelo específico negociado, condições especiais, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-control"
            style={{ minHeight: '80px', resize: 'vertical' }}
          />
        </div>

        <div className="form-actions-sticky">
          <button type="submit" className="btn btn-primary w-full save-lead-btn">
            <Save size={20} />
            Salvar Lead
          </button>
          
          <button 
            type="button" 
            onClick={() => onNavigate('dashboard')} 
            className="btn btn-outline w-full"
            style={{ marginTop: '0.5rem' }}
          >
            Cancelar
          </button>
        </div>
      </form>

      <style>{`
        .lead-form-card {
          padding: 1.5rem;
          max-width: 650px;
          margin: 0 auto;
        }

        .form-section-header {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--primary-blue);
          border-bottom: 2px solid var(--primary-blue-light);
          padding-bottom: 0.35rem;
          margin-bottom: 1rem;
          margin-top: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .form-section-header:first-of-type {
          margin-top: 0;
        }

        .city-input-group {
          display: flex;
          gap: 0.75rem;
        }

        @media (max-width: 480px) {
          .city-input-group {
            flex-direction: column;
          }
        }

        .col-span-2 {
          grid-column: span 2 / span 2;
        }

        .info-display {
          background-color: var(--bg-main);
          border-radius: var(--radius-md);
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          min-height: 48px;
        }

        /* Products Tag Selector style */
        .products-tag-selector {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .tag-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 0.5rem 0.85rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background-color: var(--bg-card);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
          flex: 1 1 calc(50% - 0.25rem); /* two column layout for tags */
          min-height: 52px;
        }

        @media (max-width: 480px) {
          .tag-btn {
            flex: 1 1 100%;
          }
        }

        .tag-btn:hover {
          background-color: var(--primary-blue-light);
          border-color: var(--primary-blue);
        }

        .tag-btn.active {
          background-color: var(--accent-orange-light);
          border-color: var(--accent-orange);
          box-shadow: 0 0 0 1px var(--accent-orange);
        }

        .tag-brand {
          font-size: 0.65rem;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .tag-btn.active .tag-brand {
          color: var(--accent-orange);
        }

        .tag-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-top: 0.125rem;
        }

        /* Alert Banners */
        .alert-banner {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: var(--radius-md);
          border: 1px solid transparent;
        }

        .alert-banner.success {
          background-color: var(--success-light);
          border-color: rgba(16, 185, 129, 0.2);
          color: var(--success);
        }

        .alert-banner.warning {
          background-color: var(--danger-light);
          border-color: rgba(239, 68, 68, 0.15);
          color: var(--danger);
        }

        .alert-title {
          font-weight: 700;
          font-size: 0.95rem;
          display: block;
        }

        .alert-desc {
          font-size: 0.85rem;
          margin-top: 0.125rem;
          opacity: 0.9;
        }

        .save-lead-btn {
          font-size: 1.05rem;
          font-weight: 600;
          height: 48px;
        }

        /* Sticky bottom action for mobile */
        @media (max-width: 768px) {
          .form-actions-sticky {
            position: fixed;
            bottom: 64px; /* above mobile nav */
            left: 0;
            right: 0;
            background-color: var(--bg-card);
            padding: 0.75rem 1rem;
            box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
            border-top: 1px solid var(--border-color);
            display: flex;
            gap: 0.5rem;
            z-index: 90;
          }

          .form-actions-sticky .btn {
            margin-top: 0 !important;
            flex: 1;
          }

          /* Pad form to prevent sticky overlap */
          .lead-form-card {
            padding-bottom: 120px;
          }
        }
      `}</style>
    </div>
  );
};
