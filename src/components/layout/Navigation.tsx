import React from 'react';
import { 
  LayoutDashboard, 
  UserPlus, 
  FileText, 
  Calendar, 
  Users, 
  Package,
  Menu,
  X
} from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  activeEventName?: string;
  activeSellerName?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onPageChange,
  activeEventName,
  activeSellerName
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'lead-register', label: 'Novo Lead', icon: UserPlus, highlight: true },
    { id: 'leads-list', label: 'Visualizar Leads', icon: FileText },
    { id: 'events', label: 'Gerenciar Eventos', icon: Calendar },
    { id: 'sellers', label: 'Vendedores', icon: Users },
    { id: 'products', label: 'Produtos', icon: Package },
  ];

  const handleNavClick = (pageId: string) => {
    onPageChange(pageId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">CS</div>
          <div>
            <h1 className="brand-title">Lead Collector</h1>
            <p className="brand-subtitle">Comercial Scardua</p>
          </div>
        </div>

        {activeEventName && (
          <div className="sidebar-status-card">
            <span className="status-dot"></span>
            <div className="status-info">
              <span className="status-label">Evento Ativo</span>
              <span className="status-value" title={activeEventName}>{activeEventName}</span>
              {activeSellerName && (
                <span className="status-seller">Vendedor: {activeSellerName}</span>
              )}
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`nav-item ${isActive ? 'active' : ''} ${item.highlight ? 'highlight' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <p>© 2026 Comercial Scardua</p>
          <p className="text-xs">Versão 1.0.0 (MVP)</p>
        </div>
      </aside>

      {/* Mobile Header / Top Bar */}
      <header className="mobile-header">
        <div className="mobile-brand" onClick={() => handleNavClick('dashboard')}>
          <span className="brand-logo-sm">CS</span>
          <span className="mobile-title">Lead Collector</span>
        </div>
        
        <div className="mobile-header-actions">
          {activeEventName && (
            <div className="mobile-event-badge" onClick={() => handleNavClick('dashboard')}>
              <span className="event-dot"></span>
              <span className="event-text" title={activeEventName}>{activeEventName}</span>
            </div>
          )}
          <button onClick={() => setIsOpen(!isOpen)} className="mobile-menu-toggle">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="mobile-drawer-backdrop" onClick={() => setIsOpen(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <span className="font-semibold text-primary">Menu de Navegação</span>
              <button onClick={() => setIsOpen(false)} className="drawer-close">
                <X size={20} />
              </button>
            </div>
            
            {activeSellerName && (
              <div className="drawer-seller-info">
                <span>Vendedor: <strong>{activeSellerName}</strong></span>
              </div>
            )}

            <nav className="drawer-nav">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`drawer-item ${isActive ? 'active' : ''} ${item.highlight ? 'highlight' : ''}`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="drawer-footer">
              <p>Comercial Scardua - Coletor de Leads</p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (For quick access on mobile) */}
      <nav className="mobile-bottom-nav">
        {menuItems.slice(0, 3).map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`bottom-nav-item ${isActive ? 'active' : ''} ${item.highlight ? 'highlight' : ''}`}
            >
              <Icon size={item.highlight ? 24 : 20} />
              <span>{item.label}</span>
            </button>
          );
        })}
        <button 
          onClick={() => handleNavClick('events')} 
          className={`bottom-nav-item ${['events', 'sellers', 'products'].includes(currentPage) ? 'active' : ''}`}
        >
          <Calendar size={20} />
          <span>Outros</span>
        </button>
      </nav>

      {/* Embedded styles specifically for layout components */}
      <style>{`
        /* Sidebar Desktop Layout */
        .desktop-sidebar {
          width: 260px;
          background-color: var(--bg-card);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 100;
          padding: 1.5rem;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .brand-logo {
          background: linear-gradient(135deg, var(--primary-blue), var(--accent-orange));
          color: white;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.2rem;
          box-shadow: var(--shadow-sm);
        }

        .brand-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--primary-blue);
          line-height: 1.2;
        }

        .brand-subtitle {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .sidebar-status-card {
          background-color: var(--primary-blue-light);
          border: 1px solid rgba(15, 76, 129, 0.1);
          border-radius: var(--radius-md);
          padding: 0.75rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--success);
          margin-top: 5px;
          display: inline-block;
          box-shadow: 0 0 8px var(--success);
        }

        .status-info {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
          overflow: hidden;
        }

        .status-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--primary-blue);
          letter-spacing: 0.05em;
        }

        .status-value {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .status-seller {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          border: 1px solid transparent;
          background: none;
          color: var(--text-secondary);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
          width: 100%;
          text-align: left;
        }

        .nav-item:hover {
          background-color: var(--bg-main);
          color: var(--primary-blue);
        }

        .nav-item.active {
          background-color: var(--primary-blue-light);
          color: var(--primary-blue);
          font-weight: 600;
        }

        .nav-item.highlight {
          border: 1px solid rgba(242, 101, 34, 0.2);
          background-color: var(--accent-orange-light);
          color: var(--accent-orange);
        }

        .nav-item.highlight:hover {
          background-color: var(--accent-orange);
          color: white;
        }

        .sidebar-footer {
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        /* Mobile Header Layout */
        .mobile-header {
          display: none;
          height: 60px;
          background-color: var(--bg-card);
          border-bottom: 1px solid var(--border-color);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 0 1rem;
          align-items: center;
          justify-content: space-between;
        }

        .mobile-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .brand-logo-sm {
          background: linear-gradient(135deg, var(--primary-blue), var(--accent-orange));
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .mobile-title {
          font-weight: 700;
          color: var(--primary-blue);
          font-size: 1rem;
        }

        .mobile-header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .mobile-event-badge {
          background-color: var(--primary-blue-light);
          border-radius: var(--radius-full);
          padding: 0.25rem 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--primary-blue);
          max-width: 150px;
          cursor: pointer;
        }

        .event-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--success);
          box-shadow: 0 0 4px var(--success);
        }

        .event-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mobile-menu-toggle {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        /* Mobile Bottom Nav Bar */
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 64px;
          background-color: var(--bg-card);
          border-top: 1px solid var(--border-color);
          z-index: 100;
          grid-template-columns: repeat(4, 1fr);
          box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.03);
        }

        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          border: none;
          background: none;
          color: var(--text-secondary);
          font-size: 0.7rem;
          font-weight: 500;
          cursor: pointer;
          transition: color var(--transition-fast);
        }

        .bottom-nav-item.active {
          color: var(--primary-blue);
          font-weight: 600;
        }

        .bottom-nav-item.highlight {
          color: var(--accent-orange);
          font-weight: 600;
        }

        /* Mobile Drawer */
        .mobile-drawer-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(2px);
          z-index: 150;
        }

        .mobile-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 280px;
          background-color: var(--bg-card);
          box-shadow: -4px 0 25px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          animation: slideLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-color);
        }

        .drawer-close {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .drawer-seller-info {
          background-color: var(--bg-main);
          border-radius: var(--radius-md);
          padding: 0.75rem 1rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .drawer-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .drawer-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          border: 1px solid transparent;
          background: none;
          color: var(--text-secondary);
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
          width: 100%;
          text-align: left;
        }

        .drawer-item:hover {
          background-color: var(--bg-main);
          color: var(--primary-blue);
        }

        .drawer-item.active {
          background-color: var(--primary-blue-light);
          color: var(--primary-blue);
          font-weight: 600;
        }

        .drawer-item.highlight {
          border: 1px solid rgba(242, 101, 34, 0.1);
          background-color: var(--accent-orange-light);
          color: var(--accent-orange);
        }

        .drawer-item.highlight.active {
          background-color: var(--accent-orange);
          color: white;
        }

        .drawer-footer {
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
          color: var(--text-muted);
          font-size: 0.75rem;
          text-align: center;
        }

        /* Responsive Visibility Adjustments */
        @media (max-width: 768px) {
          .desktop-sidebar {
            display: none;
          }
          .mobile-header {
            display: flex;
          }
          .mobile-bottom-nav {
            display: grid;
          }
        }
      `}</style>
    </>
  );
};
