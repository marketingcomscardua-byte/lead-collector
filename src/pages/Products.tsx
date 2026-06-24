import React, { useState } from 'react';
import { Product } from '../types/product';
import { INITIAL_BRANDS, INITIAL_CATEGORIES } from '../data/initialData';
import { Plus, Edit2, Package, Tag, ToggleLeft, ToggleRight } from 'lucide-react';

interface ProductsProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (id: string, product: Partial<Product>) => void;
}

export const Products: React.FC<ProductsProps> = ({
  products,
  onAddProduct,
  onUpdateProduct
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [brand, setBrand] = useState(INITIAL_BRANDS[0]);
  const [category, setCategory] = useState(INITIAL_CATEGORIES[0]);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setBrand(product.brand);
    setCategory(product.category);
    setIsActive(product.isActive);
    setShowForm(true);
    setError('');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setBrand(INITIAL_BRANDS[0]);
    setCategory(INITIAL_CATEGORIES[0]);
    setIsActive(true);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('O nome do produto é obrigatório.');
      return;
    }

    const productData = {
      name: name.trim(),
      brand,
      category,
      isActive
    };

    if (editingId) {
      onUpdateProduct(editingId, productData);
    } else {
      onAddProduct(productData);
    }

    handleCancel();
  };

  const toggleProductActive = (id: string, currentVal: boolean) => {
    onUpdateProduct(id, { isActive: !currentVal });
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Produtos de Interesse</h2>
          <p className="page-subtitle">Configuração do portfólio de máquinas e serviços</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus size={18} />
            Novo Produto
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-4 product-form">
          <h3 className="card-title">
            <Package size={20} color="var(--primary-blue)" />
            {editingId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
          </h3>

          {error && <div className="error-banner mb-4">{error}</div>}

          <div className="form-group">
            <label className="form-label">Nome Comercial do Produto *</label>
            <input
              type="text"
              placeholder="Ex: Trator Agritech 1155 Super Estreito"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Marca / Parceiro</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="form-control"
              >
                {INITIAL_BRANDS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-control"
              >
                {INITIAL_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              id="isActiveProd"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="isActiveProd" className="form-label" style={{ cursor: 'pointer', userSelect: 'none', marginBottom: 0 }}>
              Produto Ativo (aparece no formulário de leads)
            </label>
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <button type="button" onClick={handleCancel} className="btn btn-outline">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar Produto
            </button>
          </div>
        </form>
      )}

      {/* Products List Grid */}
      <div className="grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className={`card product-card ${!product.isActive ? 'product-inactive' : ''}`}>
            <div className="product-card-header">
              <span className="product-category-badge">
                <Tag size={12} />
                {product.category}
              </span>
              <span className={`badge ${product.isActive ? 'badge-active' : 'badge-completed'}`}>
                {product.isActive ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            <div className="product-info-body mt-4">
              <span className="product-brand-label">{product.brand}</span>
              <h4 className="product-name-title">{product.name}</h4>
            </div>

            <div className="product-card-footer mt-4">
              <button 
                onClick={() => toggleProductActive(product.id, product.isActive)}
                className="btn-toggle-active"
                title={product.isActive ? "Desativar produto" : "Ativar produto"}
              >
                {product.isActive ? (
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

              <button onClick={() => handleEdit(product)} className="btn-icon-only" title="Editar">
                <Edit2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .product-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.25rem;
        }

        .product-card.product-inactive {
          opacity: 0.7;
          background-color: #fafbfc;
        }

        .product-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .product-category-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background-color: var(--primary-blue-light);
          color: var(--primary-blue);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.2rem 0.625rem;
          border-radius: var(--radius-sm);
        }

        .product-brand-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--accent-orange);
          letter-spacing: 0.05em;
        }

        .product-name-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-top: 0.125rem;
          line-height: 1.3;
        }

        .product-card-footer {
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
