import React, { useState, useMemo } from 'react';
import { Lead, LeadStatus } from '../types/lead';
import { Event } from '../types/event';
import { Seller } from '../types/seller';
import { Product } from '../types/product';
import { formatDateTime } from '../utils/dateFormat';
import { exportLeadsToCSV } from '../services/export';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronRight, 
  X, 
  MapPin, 
  User, 
  Calendar,
  MessageSquare,
  Clock,
  Eye
} from 'lucide-react';

interface LeadsListProps {
  leads: Lead[];
  events: Event[];
  sellers: Seller[];
  products: Product[];
  onUpdateLeadStatus: (id: string, status: LeadStatus) => void;
}

const statusLabelMap: Record<LeadStatus, string> = {
  novo: 'Novo',
  em_atendimento: 'Em Atendimento',
  interessado: 'Interessado',
  sem_retorno: 'Sem Retorno',
  convertido: 'Convertido',
  perdido: 'Perdido'
};

export const LeadsList: React.FC<LeadsListProps> = ({
  leads,
  events,
  sellers,
  products,
  onUpdateLeadStatus
}) => {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEventId, setFilterEventId] = useState('');
  const [filterSellerId, setFilterSellerId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProductId, setFilterProductId] = useState('');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Selected Lead for Detail Modal
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // 1. Search text (name or phone)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchLower) ||
        lead.phone.includes(searchTerm);

      // 2. Event
      const matchesEvent = !filterEventId || lead.eventId === filterEventId;

      // 3. Seller
      const matchesSeller = !filterSellerId || lead.sellerId === filterSellerId;

      // 4. Status
      const matchesStatus = !filterStatus || lead.status === filterStatus;

      // 5. Product
      const matchesProduct = !filterProductId || lead.productIds.includes(filterProductId);

      return matchesSearch && matchesEvent && matchesSeller && matchesStatus && matchesProduct;
    });
  }, [leads, searchTerm, filterEventId, filterSellerId, filterStatus, filterProductId]);

  // Export handler
  const handleExport = () => {
    exportLeadsToCSV(filteredLeads, events, sellers, products);
  };

  const handleOpenLeadDetail = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleCloseModal = () => {
    setSelectedLead(null);
  };

  const handleStatusChange = (statusVal: LeadStatus) => {
    if (selectedLead) {
      onUpdateLeadStatus(selectedLead.id, statusVal);
      // Update local modal view state
      setSelectedLead(prev => prev ? { ...prev, status: statusVal, updatedAt: new Date().toISOString() } : null);
    }
  };

  return (
    <div className="leads-list-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Leads Capturados</h2>
          <p className="page-subtitle">Listagem de clientes e ferramentas de exportação</p>
        </div>
        <button onClick={handleExport} className="btn btn-outline" disabled={filteredLeads.length === 0}>
          <Download size={18} />
          Exportar CSV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <section className="card filters-card mb-4">
        <div className="search-row">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control search-input"
            />
          </div>
          <button 
            type="button" 
            onClick={() => setShowFiltersMobile(!showFiltersMobile)} 
            className="btn btn-outline mobile-filter-toggle"
          >
            <Filter size={18} />
            Filtros
          </button>
        </div>

        <div className={`filters-grid ${showFiltersMobile ? 'show' : ''}`}>
          <div className="form-group">
            <label className="form-label text-xs">Filtrar por Evento</label>
            <select
              value={filterEventId}
              onChange={(e) => setFilterEventId(e.target.value)}
              className="form-control filter-select"
            >
              <option value="">Todos os Eventos</option>
              {events.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label text-xs">Filtrar por Vendedor</label>
            <select
              value={filterSellerId}
              onChange={(e) => setFilterSellerId(e.target.value)}
              className="form-control filter-select"
            >
              <option value="">Todos os Vendedores</option>
              {sellers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label text-xs">Filtrar por Produto</label>
            <select
              value={filterProductId}
              onChange={(e) => setFilterProductId(e.target.value)}
              className="form-control filter-select"
            >
              <option value="">Todos os Produtos</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.brand} - {p.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label text-xs">Filtrar por Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-control filter-select"
            >
              <option value="">Todos os Status</option>
              {Object.entries(statusLabelMap).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Leads Count info */}
      <div className="leads-meta mb-2">
        <span className="text-sm text-secondary">
          Mostrando <strong>{filteredLeads.length}</strong> de <strong>{leads.length}</strong> leads capturados.
        </span>
      </div>

      {/* Leads Grid */}
      {filteredLeads.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem 1.5rem' }}>
          <p className="text-secondary">Nenhum lead encontrado com os filtros selecionados.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setFilterEventId('');
              setFilterSellerId('');
              setFilterProductId('');
              setFilterStatus('');
            }}
            className="btn btn-outline mt-4"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="leads-grid">
          {filteredLeads.map((lead) => {
            const eventName = events.find(e => e.id === lead.eventId)?.name || 'Evento Desconhecido';
            const sellerName = sellers.find(s => s.id === lead.sellerId)?.name || 'Vendedor Desconhecido';
            const leadProducts = lead.productIds
              .map(pid => products.find(p => p.id === pid)?.name)
              .filter(Boolean);

            return (
              <div key={lead.id} className="card lead-card" onClick={() => handleOpenLeadDetail(lead)}>
                <div className="lead-card-header">
                  <div>
                    <h4 className="lead-card-name">{lead.name}</h4>
                    <span className="lead-card-phone">{lead.phone}</span>
                  </div>
                  <span className={`badge badge-${lead.status}`}>
                    {statusLabelMap[lead.status]}
                  </span>
                </div>

                <div className="lead-card-body">
                  <div className="lead-meta-item">
                    <Calendar size={14} />
                    <span>{eventName}</span>
                  </div>
                  <div className="lead-meta-item">
                    <User size={14} />
                    <span>Vendedor: {sellerName}</span>
                  </div>
                  <div className="lead-meta-item">
                    <MapPin size={14} />
                    <span>{lead.city} - {lead.state}</span>
                  </div>

                  {leadProducts.length > 0 && (
                    <div className="lead-products-list mt-2">
                      {leadProducts.map((pName, idx) => (
                        <span key={idx} className="lead-product-tag">{pName}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lead-card-footer">
                  <span className="lead-card-date">Cadastrado em {formatDateTime(lead.createdAt)}</span>
                  <button className="btn-view-detail">
                    <Eye size={16} />
                    Ver Detalhes
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="text-xs text-secondary uppercase font-semibold tracking-wider">Ficha do Lead</span>
                <h3 className="modal-title font-bold text-lg" style={{ color: 'var(--primary-blue)' }}>
                  {selectedLead.name}
                </h3>
              </div>
              <button onClick={handleCloseModal} className="drawer-close">
                <X size={22} />
              </button>
            </div>

            <div className="modal-body">
              <div className="lead-detail-grid">
                
                {/* Editable Status */}
                <div className="detail-section highlight">
                  <label className="form-label font-semibold">Status do Atendimento</label>
                  <select
                    value={selectedLead.status}
                    onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                    className="form-control mt-1"
                  >
                    {Object.entries(statusLabelMap).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="detail-group">
                  <span className="detail-label">Telefone / WhatsApp</span>
                  <span className="detail-val font-semibold">{selectedLead.phone}</span>
                </div>

                <div className="detail-group">
                  <span className="detail-label">Localização</span>
                  <span className="detail-val">{selectedLead.city} - {selectedLead.state}</span>
                </div>

                <div className="detail-group">
                  <span className="detail-label">Evento de Origem</span>
                  <span className="detail-val">
                    {events.find(e => e.id === selectedLead.eventId)?.name || 'Evento Desconhecido'}
                  </span>
                </div>

                <div className="detail-group">
                  <span className="detail-label">Vendedor Responsável</span>
                  <span className="detail-val">
                    {sellers.find(s => s.id === selectedLead.sellerId)?.name || 'Vendedor Desconhecido'}
                  </span>
                </div>

                <div className="detail-group">
                  <span className="detail-label">Produtos de Interesse</span>
                  <div className="lead-products-list mt-1">
                    {selectedLead.productIds.map(pid => {
                      const p = products.find(prod => prod.id === pid);
                      return p ? (
                        <span key={pid} className="lead-product-tag large">
                          <strong>{p.brand}</strong> - {p.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>

                {selectedLead.notes && (
                  <div className="detail-group full-width">
                    <span className="detail-label flex align-center gap-1">
                      <MessageSquare size={14} /> Observações
                    </span>
                    <p className="detail-notes">{selectedLead.notes}</p>
                  </div>
                )}

                <div className="detail-timestamps mt-2">
                  <span className="timestamp-item">
                    <Clock size={12} />
                    Criado: {formatDateTime(selectedLead.createdAt)}
                  </span>
                  {selectedLead.updatedAt !== selectedLead.createdAt && (
                    <span className="timestamp-item">
                      <Clock size={12} />
                      Atualizado: {formatDateTime(selectedLead.updatedAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={handleCloseModal} className="btn btn-primary">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .search-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .search-input-wrapper {
          position: relative;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          padding-left: 2.75rem;
        }

        .mobile-filter-toggle {
          display: none;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        @media (max-width: 900px) {
          .filters-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .search-row {
            flex-direction: row;
          }
          .mobile-filter-toggle {
            display: inline-flex;
          }
          .filters-grid {
            display: none;
            grid-template-columns: 1fr;
            margin-top: 1rem;
            border-top: 1px solid var(--border-color);
            padding-top: 1rem;
          }
          .filters-grid.show {
            display: grid;
          }
        }

        .leads-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }

        @media (max-width: 1024px) {
          .leads-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .leads-grid {
            grid-template-columns: 1fr;
          }
        }

        .lead-card {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.25rem;
        }

        .lead-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .lead-card-name {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .lead-card-phone {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .lead-card-body {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          flex: 1;
        }

        .lead-meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .lead-products-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }

        .lead-product-tag {
          font-size: 0.7rem;
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          padding: 0.125rem 0.5rem;
          border-radius: var(--radius-sm);
          color: var(--text-primary);
        }

        .lead-product-tag.large {
          font-size: 0.8rem;
          padding: 0.25rem 0.625rem;
          background-color: var(--primary-blue-light);
          border-color: rgba(15, 76, 129, 0.1);
        }

        .lead-card-footer {
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .lead-card-date {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .btn-view-detail {
          background: none;
          border: none;
          color: var(--primary-blue);
          font-weight: 600;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          cursor: pointer;
        }

        /* Lead Details Modal Specifics */
        .lead-detail-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .detail-section.highlight {
          background-color: var(--bg-main);
          padding: 0.75rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
        }

        .detail-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: 0.02em;
        }

        .detail-val {
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .detail-notes {
          font-size: 0.9rem;
          background-color: var(--warning-light);
          border-left: 3px solid var(--warning);
          padding: 0.75rem;
          border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
          color: var(--text-secondary);
        }

        .detail-timestamps {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid var(--border-color);
          padding-top: 0.75rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .timestamp-item {
          font-size: 0.7rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
      `}</style>
    </div>
  );
};
