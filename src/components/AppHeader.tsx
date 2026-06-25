import React from 'react';
import { User } from 'lucide-react';

interface AppHeaderProps {
  onProfileClick: () => void;
  sellerInitials?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onProfileClick, sellerInitials = 'U' }) => {
  return (
    <header className="app-header">
      <div className="flex align-center gap-3">
        <div className="app-logo-box">
          <img src="/assets/brand/lead-collector-avatar.svg" alt="Lead Collector" className="app-logo-icon" />
        </div>
        <div className="header-brand">
          <span className="header-title">Coletor de Leads</span>
          <span className="header-subtitle">Grupo Scardua</span>
        </div>
      </div>
      <button 
        type="button" 
        className="header-profile-btn" 
        onClick={onProfileClick}
        aria-label="Perfil do Vendedor"
      >
        {sellerInitials ? (
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{sellerInitials}</span>
        ) : (
          <User size={20} />
        )}
      </button>
    </header>
  );
};
