import React, { useMemo } from 'react';
import { Lead } from '../types/lead';
import { Event } from '../types/event';
import { Seller } from '../types/seller';
import { Product } from '../types/product';
import { 
  Users, 
  FileText, 
  Calendar, 
  TrendingUp, 
  UserPlus, 
  Award,
  AlertCircle
} from 'lucide-react';

interface DashboardProps {
  leads: Lead[];
  events: Event[];
  sellers: Seller[];
  products: Product[];
  activeEventId: string;
  activeSellerId: string;
  onActiveEventChange: (id: string) => void;
  onActiveSellerChange: (id: string) => void;
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  leads,
  events,
  sellers,
  products,
  activeEventId,
  activeSellerId,
  onActiveEventChange,
  onActiveSellerChange,
  onNavigate
}) => {
  
  // Find current active event
  const currentEvent = useMemo(() => {
    return events.find(e => e.id === activeEventId);
  }, [events, activeEventId]);

  // Find current active seller
  const currentSeller = useMemo(() => {
    return sellers.find(s => s.id === activeSellerId);
  }, [sellers, activeSellerId]);

  // Filter leads for the active event
  const eventLeads = useMemo(() => {
    return leads.filter(l => l.eventId === activeEventId);
  }, [leads, activeEventId]);

  // Count leads created today (active event)
  const leadsToday = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return eventLeads.filter(l => {
      try {
        const leadDateStr = new Date(l.createdAt).toISOString().split('T')[0];
        return leadDateStr === todayStr;
      } catch {
        return false;
      }
    }).length;
  }, [eventLeads]);

  // Seller performance ranking (for active event)
  const sellersPerformance = useMemo(() => {
    const counts: Record<string, number> = {};
    
    // Initialize active event sellers
    sellers.forEach(s => {
      if (s.isActive) counts[s.id] = 0;
    });

    eventLeads.forEach(l => {
      counts[l.sellerId] = (counts[l.sellerId] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([id, count]) => {
        const seller = sellers.find(s => s.id === id);
        return {
          id,
          name: seller ? seller.name : 'Vendedor Inativo/Excluído',
          count
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [eventLeads, sellers]);

  // Product popularity ranking (for active event)
  const productsPerformance = useMemo(() => {
    const counts: Record<string, number> = {};
    
    eventLeads.forEach(l => {
      l.productIds.forEach(pid => {
        counts[pid] = (counts[pid] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([id, count]) => {
        const product = products.find(p => p.id === id);
        return {
          id,
          name: product ? product.name : 'Produto Desconhecido',
          brand: product ? product.brand : '',
          count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // top 5
  }, [eventLeads, products]);

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Painel de Controle</h2>
          <p className="page-subtitle">Acompanhamento e estatísticas em tempo real</p>
        </div>
        <button 
          onClick={() => onNavigate('lead-register')} 
          className="btn btn-primary"
          style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
        >
          <UserPlus size={20} />
          Registrar Lead
        </button>
      </div>

      {/* Configuration Selectors */}
      <section className="card config-selector-card mb-4">
        <h3 className="card-title" style={{ marginBottom: '0.75rem', fontSize: '1rem', color: 'var(--primary-blue)' }}>
          Configuração de Captura Rápida
        </h3>
        <div className="config-grid">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Evento Ativo Atual</label>
            <select 
              value={activeEventId} 
              onChange={(e) => onActiveEventChange(e.target.value)}
              className="form-control"
            >
              <option value="">-- Selecione o Evento --</option>
              {events.map(e => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.location}) {e.status === 'active' ? '[ATIVO]' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Vendedor Operando</label>
            <select 
              value={activeSellerId} 
              onChange={(e) => onActiveSellerChange(e.target.value)}
              className="form-control"
            >
              <option value="">-- Selecione o Vendedor --</option>
              {sellers.filter(s => s.isActive).map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Warning if no event selected */}
      {!activeEventId && (
        <div className="alert-banner mb-4">
          <AlertCircle size={20} />
          <span>Atenção: Selecione um evento ativo para visualizar os dados e capturar leads.</span>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid-cols-3 mb-4">
        <div className="card stats-card">
          <div className="stats-icon blue">
            <FileText size={24} />
          </div>
          <div>
            <span className="stats-label">Leads no Evento</span>
            <h4 className="stats-value">{eventLeads.length}</h4>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-icon orange">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="stats-label">Leads Capturados Hoje</span>
            <h4 className="stats-value">{leadsToday}</h4>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-icon green">
            <Calendar size={24} />
          </div>
          <div>
            <span className="stats-label">Status do Evento</span>
            <h4 className="stats-value" style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>
              {currentEvent ? (
                <span className={`badge badge-${currentEvent.status}`}>
                  {currentEvent.status === 'active' ? 'Ativo' : currentEvent.status === 'future' ? 'Futuro' : 'Finalizado'}
                </span>
              ) : 'Nenhum'}
            </h4>
          </div>
        </div>
      </div>

      {/* Main Charts & Rankings */}
      <div className="dashboard-grid">
        {/* Left: Products Ranking */}
        <div className="card">
          <h3 className="card-title">
            <TrendingUp size={20} color="var(--accent-orange)" />
            Produtos de Maior Interesse
          </h3>
          {productsPerformance.length === 0 ? (
            <p className="empty-text">Nenhum interesse registrado para este evento ainda.</p>
          ) : (
            <div className="ranking-list">
              {productsPerformance.map((item, idx) => (
                <div key={item.id} className="ranking-item">
                  <div className="ranking-rank">{idx + 1}</div>
                  <div className="ranking-info">
                    <span className="ranking-name">{item.name}</span>
                    <span className="ranking-sub">{item.brand}</span>
                  </div>
                  <div className="ranking-badge">{item.count} leads</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Seller Performance */}
        <div className="card">
          <h3 className="card-title">
            <Award size={20} color="var(--primary-blue)" />
            Desempenho dos Vendedores
          </h3>
          {sellersPerformance.length === 0 ? (
            <p className="empty-text">Nenhum vendedor registrou leads neste evento.</p>
          ) : (
            <div className="ranking-list">
              {sellersPerformance.map((item, idx) => (
                <div key={item.id} className={`ranking-item ${item.id === activeSellerId ? 'current-seller' : ''}`}>
                  <div className="ranking-rank">{idx + 1}</div>
                  <div className="ranking-info">
                    <span className="ranking-name">
                      {item.name}
                      {item.id === activeSellerId && <span className="current-label"> (Você)</span>}
                    </span>
                  </div>
                  <div className="ranking-badge secondary">{item.count} leads</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .config-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 640px) {
          .config-grid {
            grid-template-columns: 1fr;
          }
        }

        .alert-banner {
          background-color: var(--danger-light);
          border: 1px solid rgba(239, 68, 68, 0.15);
          color: var(--danger);
          padding: 1rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .stats-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.25rem;
        }

        .stats-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stats-icon.blue { background-color: var(--primary-blue-light); color: var(--primary-blue); }
        .stats-icon.orange { background-color: var(--accent-orange-light); color: var(--accent-orange); }
        .stats-icon.green { background-color: var(--success-light); color: var(--success); }

        .stats-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .stats-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.1;
          margin-top: 0.125rem;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        .ranking-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .ranking-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          background-color: var(--bg-main);
          border: 1px solid transparent;
        }

        .ranking-item.current-seller {
          border-color: rgba(15, 76, 129, 0.2);
          background-color: var(--primary-blue-light);
        }

        .current-label {
          font-size: 0.75rem;
          color: var(--primary-blue);
          font-weight: 600;
        }

        .ranking-rank {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-muted);
          width: 24px;
          text-align: center;
        }

        .ranking-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .ranking-name {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .ranking-sub {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .ranking-badge {
          background-color: var(--accent-orange-light);
          color: var(--accent-orange);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
        }

        .ranking-badge.secondary {
          background-color: var(--primary-blue-light);
          color: var(--primary-blue);
        }

        .empty-text {
          color: var(--text-muted);
          font-size: 0.9rem;
          text-align: center;
          padding: 2rem 0;
        }
      `}</style>
    </div>
  );
};
