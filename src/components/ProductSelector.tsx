import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

interface ProductSelectorProps {
  products: string[];
  selectedProducts: string[];
  onChange: (selected: string[]) => void;
  error?: string;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  selectedProducts,
  onChange,
  error,
}) => {
  const handleToggle = (product: string) => {
    if (selectedProducts.includes(product)) {
      onChange(selectedProducts.filter((p) => p !== product));
    } else {
      onChange([...selectedProducts, product]);
    }
  };

  return (
    <div className="form-group">
      <div className="section-title-wrapper">
        <label className="section-title">Produtos de Interesse *</label>
        <div className="section-subtitle">(Selecione um ou mais)</div>
      </div>
      
      <div className="products-grid">
        {products.map((product) => {
          const isSelected = selectedProducts.includes(product);
          return (
            <button
              key={product}
              type="button"
              className={`product-pill-card ${isSelected ? 'selected' : ''}`}
              onClick={() => handleToggle(product)}
            >
              <span>{product}</span>
              <div className="selection-circle">
                {isSelected && <Check size={12} strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <span className="error-message">
          <AlertCircle size={14} />
          {error}
        </span>
      )}
    </div>
  );
};
