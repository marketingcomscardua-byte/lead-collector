import React, { useState } from 'react';
import { Seller } from '../types/seller';
import { Plus, Edit2, User, Phone, Mail, ToggleLeft, ToggleRight, Check, X } from 'lucide-react';
import { maskPhone } from '../utils/phoneMask';
import { validatePhone, validateEmail } from '../utils/validators';

interface SellersProps {
  sellers: Seller[];
  onAddSeller: (seller: Omit<Seller, 'id'>) => void;
  onUpdateSeller: (id: string, seller: Partial<Seller>) => void;
}

export const Sellers: React.FC<SellersProps> = ({
  sellers,
  onAddSeller,
  onUpdateSeller
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(maskPhone(e.target.value));
    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
  };

  const handleEdit = (seller: Seller) => {
    setEditingId(seller.id);
    setName(seller.name);
    setPhone(maskPhone(seller.phone));
    setEmail(seller.email || '');
    setIsActive(seller.isActive);
    setShowForm(true);
    setErrors({});
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setPhone('');
    setEmail('');
    setIsActive(true);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Nome é obrigatório.';
    if (!phone) {
      newErrors.phone = 'Telefone é obrigatório.';
    } else if (!validatePhone(phone)) {
      newErrors.phone = 'Digite um telefone válido.';
    }
    if (email && !validateEmail(email)) {
      newErrors.email = 'Digite um e-mail válido.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const sellerData = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      isActive
    };

    if (editingId) {
      onUpdateSeller(editingId, sellerData);
    } else {
      onAddSeller(sellerData);
    }

    handleCancel();
  };

  const toggleSellerActive = (id: string, currentVal: boolean) => {
    onUpdateSeller(id, { isActive: !currentVal });
  };

  return (
    <div className="sellers-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Equipe de Vendas</h2>
          <p className="page-subtitle">Cadastro de vendedores habilitados para captação</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus size={18} />
            Novo Vendedor
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-4 seller-form">
          <h3 className="card-title">
            <User size={20} color="var(--primary-blue)" />
            {editingId ? 'Editar Vendedor' : 'Cadastrar Novo Vendedor'}
          </h3>

          <div className="form-group">
            <label className="form-label">Nome Completo *</label>
            <input
              type="text"
              placeholder="Ex: João Silva"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
              }}
              className={`form-control ${errors.name ? 'error' : ''}`}
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
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
              <label className="form-label">E-mail (Opcional)</label>
              <input
                type="email"
                placeholder="Ex: joao@comercialscardua.com.br"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
                className={`form-control ${errors.email ? 'error' : ''}`}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="isActive" className="form-label" style={{ cursor: 'pointer', userSelect: 'none', marginBottom: 0 }}>
              Vendedor Ativo (aparece no coletor de leads)
            </label>
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <button type="button" onClick={handleCancel} className="btn btn-outline">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar Vendedor
            </button>
          </div>
        </form>
      )}

      {/* Sellers List Grid */}
      <div className="grid-cols-3">
        {sellers.map((seller) => (
          <div key={seller.id} className={`card seller-card ${!seller.isActive ? 'seller-inactive' : ''}`}>
            <div className="seller-card-header">
              <div className="seller-avatar">
                {seller.name.substring(0, 2).toUpperCase()}
              </div>
              <span className={`badge ${seller.isActive ? 'badge-active' : 'badge-completed'}`}>
                {seller.isActive ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            <div className="seller-info-body mt-4">
              <h4 className="seller-name">{seller.name}</h4>
              
              <div className="seller-contact-item mt-3">
                <Phone size={14} />
                <span>{seller.phone}</span>
              </div>
              
              {seller.email && (
                <div className="seller-contact-item">
                  <Mail size={14} />
                  <span className="email-text" title={seller.email}>{seller.email}</span>
                </div>
              )}
            </div>

            <div className="seller-card-actions mt-4">
              <button 
                onClick={() => toggleSellerActive(seller.id, seller.isActive)}
                className="btn-toggle-active"
                title={seller.isActive ? "Desativar vendedor" : "Ativar vendedor"}
              >
                {seller.isActive ? (
                  <>
                    <ToggleRight size={22} color="var(--success)" />
                    <span className="text-xs text-secondary">Ativo</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft size={22} color="var(--text-muted)" />
                    <span className="text-xs text-muted">Inativo</span>
                  </>
                )}
              </button>

              <button onClick={() => handleEdit(seller)} className="btn-icon-only" title="Editar">
                <Edit2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .seller-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.25rem;
        }

        .seller-card.seller-inactive {
          opacity: 0.7;
          background-color: #fafbfc;
        }

        .seller-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .seller-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: var(--primary-blue-light);
          color: var(--primary-blue);
          font-weight: 700;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(15, 76, 129, 0.1);
        }

        .seller-name {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .seller-contact-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .email-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .seller-card-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-color);
          padding-top: 0.75rem;
        }

        .btn-toggle-active {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: none;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
