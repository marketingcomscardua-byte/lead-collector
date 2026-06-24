import { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { LeadRegister } from './pages/LeadRegister';
import { LeadsList } from './pages/LeadsList';
import { Events } from './pages/Events';
import { Sellers } from './pages/Sellers';
import { Products } from './pages/Products';
import { storageService } from './services/storage';
import { Lead, LeadStatus } from './types/lead';
import { Event } from './types/event';
import { Seller } from './types/seller';
import { Product } from './types/product';

function App() {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  
  // App States
  const [leads, setLeads] = useState<Lead[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeEventId, setActiveEventId] = useState<string>('');
  const [activeSellerId, setActiveSellerId] = useState<string>('');

  // Initial loading
  useEffect(() => {
    // Load initial structures into LocalStorage if not present
    storageService.init();

    // Fetch lists
    setLeads(storageService.getLeads());
    setEvents(storageService.getEvents());
    setSellers(storageService.getSellers());
    setProducts(storageService.getProducts());
    setActiveEventId(storageService.getActiveEventId());
    setActiveSellerId(storageService.getActiveSellerId());
  }, []);

  // Action handlers
  const handleAddLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLead = storageService.addLead(leadData);
    setLeads(prev => [newLead, ...prev]);
  };

  const handleUpdateLeadStatus = (id: string, status: LeadStatus) => {
    const updatedLead = storageService.updateLead(id, { status });
    setLeads(prev => prev.map(l => l.id === id ? updatedLead : l));
  };

  const handleAddEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent = storageService.addEvent(eventData);
    setEvents(prev => [...prev, newEvent]);
  };

  const handleUpdateEvent = (id: string, fields: Partial<Event>) => {
    const updatedEvent = storageService.updateEvent(id, fields);
    setEvents(prev => prev.map(e => e.id === id ? updatedEvent : e));
    
    // If we marked this event completed and it was the active context, clear or adjust
    if (fields.status === 'completed' && activeEventId === id) {
      // Find another active event if exists
      const activeEv = storageService.getEvents().find(e => e.status === 'active' && e.id !== id);
      const nextId = activeEv ? activeEv.id : '';
      storageService.setActiveEventId(nextId);
      setActiveEventId(nextId);
    }
  };

  const handleSetActiveEvent = (id: string) => {
    storageService.setActiveEventId(id);
    setActiveEventId(id);
  };

  const handleSetActiveSeller = (id: string) => {
    storageService.setActiveSellerId(id);
    setActiveSellerId(id);
  };

  const handleAddSeller = (sellerData: Omit<Seller, 'id'>) => {
    const newSeller = storageService.addSeller(sellerData);
    setSellers(prev => [...prev, newSeller]);
  };

  const handleUpdateSeller = (id: string, fields: Partial<Seller>) => {
    const updatedSeller = storageService.updateSeller(id, fields);
    setSellers(prev => prev.map(s => s.id === id ? updatedSeller : s));
  };

  const handleAddProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct = storageService.addProduct(productData);
    setProducts(prev => [...prev, newProduct]);
  };

  const handleUpdateProduct = (id: string, fields: Partial<Product>) => {
    const updatedProduct = storageService.updateProduct(id, fields);
    setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
  };

  // Find names for active context labels in layout
  const activeEventName = events.find(e => e.id === activeEventId)?.name;
  const activeSellerName = sellers.find(s => s.id === activeSellerId)?.name;

  // Page Routing Switcher
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            leads={leads}
            events={events}
            sellers={sellers}
            products={products}
            activeEventId={activeEventId}
            activeSellerId={activeSellerId}
            onActiveEventChange={handleSetActiveEvent}
            onActiveSellerChange={handleSetActiveSeller}
            onNavigate={setCurrentPage}
          />
        );
      case 'lead-register':
        return (
          <LeadRegister
            leads={leads}
            events={events}
            sellers={sellers}
            products={products}
            activeEventId={activeEventId}
            activeSellerId={activeSellerId}
            onAddLead={handleAddLead}
            onNavigate={setCurrentPage}
          />
        );
      case 'leads-list':
        return (
          <LeadsList
            leads={leads}
            events={events}
            sellers={sellers}
            products={products}
            onUpdateLeadStatus={handleUpdateLeadStatus}
          />
        );
      case 'events':
        return (
          <Events
            events={events}
            activeEventId={activeEventId}
            onAddEvent={handleAddEvent}
            onUpdateEvent={handleUpdateEvent}
            onSetActiveEvent={handleSetActiveEvent}
          />
        );
      case 'sellers':
        return (
          <Sellers
            sellers={sellers}
            onAddSeller={handleAddSeller}
            onUpdateSeller={handleUpdateSeller}
          />
        );
      case 'products':
        return (
          <Products
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
          />
        );
      default:
        return <div className="card">Página não encontrada.</div>;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      activeEventName={activeEventName}
      activeSellerName={activeSellerName}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
