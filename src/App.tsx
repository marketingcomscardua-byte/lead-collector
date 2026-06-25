import { useState, useEffect } from 'react';
import { leadCollectorStorage } from './storage/leadCollectorStorage';
import { initializeAppData } from './storage/initializeAppData';
import { dataProvider } from './services/dataProvider';
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
    const checkSession = async () => {
      try {
        const sessionSeller = await dataProvider.getCurrentSeller();
        if (sessionSeller) {
          setCurrentSeller(sessionSeller);
          const count = await dataProvider.getLeadsCountBySeller(sessionSeller.id);
          setLeadsCount(count);
        }
      } catch (err) {
        console.error("Error loading session:", err);
      }
    };
    checkSession();
  }, []);

  const handleOpenProfile = async () => {
    if (currentSeller) {
      try {
        const count = await dataProvider.getLeadsCountBySeller(currentSeller.id);
        setLeadsCount(count);
      } catch (err) {
        console.error("Error updating leads count:", err);
      }
    }
    setIsProfileOpen(true);
  };

  const handleUpdateSeller = async (fields: Partial<Seller>) => {
    if (!currentSeller) return;
    try {
      const updated = await dataProvider.updateSeller(currentSeller.id, fields);
      setCurrentSeller(updated);
    } catch (err) {
      console.error("Error updating seller:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await dataProvider.logout();
      setCurrentSeller(null);
      setIsProfileOpen(false);
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const handleLoginSuccess = async (seller: Seller) => {
    setCurrentSeller(seller);
    try {
      const count = await dataProvider.getLeadsCountBySeller(seller.id);
      setLeadsCount(count);
    } catch (err) {
      console.error("Error fetching count:", err);
    }
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

