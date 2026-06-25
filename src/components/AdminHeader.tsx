import React from 'react';
import { LogOut, BarChart3, Calendar, Building2, Users, ShoppingBag, Database } from 'lucide-react';
import { InstallPwaButton } from './common/InstallPwaButton';

interface AdminHeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentTab,
  onTabChange,
  onLogout,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'events', label: 'Eventos', icon: Calendar },
    { id: 'companies', label: 'Empresas', icon: Building2 },
    { id: 'sellers', label: 'Vendedores', icon: Users },
    { id: 'products', label: 'Produtos', icon: ShoppingBag },
    { id: 'leads', label: 'Leads', icon: Database },
  ];

  return (
    <div>
      {/* Top Header */}
      <header className="admin-header">
        <div className="flex align-center gap-3" style={{ flex: 1 }}>
          <div className="app-logo-box" style={{ width: '84px', height: '48px', borderRadius: '8px', padding: '4px' }}>
            <img src="/assets/brand/lead-collector-logo.svg" alt="Lead Collector" className="app-logo-icon" />
          </div>
          <div className="admin-header-title">
            <h1>Painel Administrativo</h1>
            <p>Gerencie eventos, empresas, vendedores e leads | Grupo Scardua</p>
          </div>
        </div>
        <div className="admin-header-actions">
          <InstallPwaButton variant="admin" />
          <button
            type="button"
            className="btn btn-danger-light btn-sm logout-button"
            onClick={onLogout}
            style={{ width: 'auto' }}
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </header>

      {/* Navigation tabs */}
      <nav className="admin-navbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={`admin-nav-item ${currentTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
