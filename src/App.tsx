import { useState, useEffect } from 'react';
import { leadCollectorStorage } from './storage/leadCollectorStorage';
import { initializeAppData } from './storage/initializeAppData';
import { Seller } from './types/seller';
import { isAdminRole } from './utils/accessControl';
import { LoginPage } from './pages/LoginPage';
import { NewLeadPage } from './pages/NewLeadPage';
import { AppHeader } from './components/AppHeader';
import { ProfileModal } from './components/ProfileModal';
import { AdminHeader } from './components/AdminHeader';
import { AdminPanel } from './pages/AdminPanel';

function App() {
  const [currentSeller, setCurrentSeller] = useState<Seller | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [leadsCount, setLeadsCount] = useState(0);
  const [adminTab, setAdminTab] = useState('dashboard');

  useEffect(() => {
    // Initialize storage seed data if needed
    leadCollectorStorage.init();

    // Run central automated initialization & migration
    initializeAppData();

    // Check if seller session exists
    const sessionSeller = leadCollectorStorage.getCurrentSeller();
    if (sessionSeller) {
      setCurrentSeller(sessionSeller);
      setLeadsCount(leadCollectorStorage.getLeadsCountBySeller(sessionSeller.id));
    }
  }, []);

  const handleOpenProfile = () => {
    if (currentSeller) {
      setLeadsCount(leadCollectorStorage.getLeadsCountBySeller(currentSeller.id));
    }
    setIsProfileOpen(true);
  };

  const handleUpdateSeller = (fields: Partial<Seller>) => {
    if (!currentSeller) return;
    const updated = leadCollectorStorage.updateSeller(currentSeller.id, fields);
    setCurrentSeller(updated);
  };

  const handleLogout = () => {
    leadCollectorStorage.setCurrentSellerId(null);
    setCurrentSeller(null);
    setIsProfileOpen(false);
  };

  const handleLoginSuccess = (seller: Seller) => {
    setCurrentSeller(seller);
    setLeadsCount(leadCollectorStorage.getLeadsCountBySeller(seller.id));
    setAdminTab('dashboard'); // Reset tab on admin login
  };

  const initials = currentSeller?.name
    ? currentSeller.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  // Render Admin Layout (root_admin, company_admin, or legacy 'Admin')
  if (currentSeller && isAdminRole(currentSeller.role)) {
    return (
      <div className="admin-layout">
        <AdminHeader 
          currentTab={adminTab} 
          onTabChange={setAdminTab} 
          onLogout={handleLogout} 
        />
        <main className="admin-container" style={{ flex: 1 }}>
          <AdminPanel currentTab={adminTab} seller={currentSeller} />
        </main>
      </div>
    );
  }

  // Render Seller/Logged Out Mobile Layout
  return (
    <div className="app-viewport">
      {currentSeller && (
        <AppHeader onProfileClick={handleOpenProfile} sellerInitials={initials} />
      )}
      <main className="scrollable-content">
        {currentSeller ? (
          <NewLeadPage 
            seller={currentSeller} 
            onOpenProfile={handleOpenProfile} 
          />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}
      </main>

      {isProfileOpen && currentSeller && (
        <ProfileModal
          seller={currentSeller}
          leadsCount={leadsCount}
          onClose={() => setIsProfileOpen(false)}
          onUpdateSeller={handleUpdateSeller}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;

