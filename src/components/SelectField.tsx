import React, { SelectHTMLAttributes } from 'react';
import { LucideIcon, ChevronDown, AlertCircle } from 'lucide-react';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  placeholderOption?: string;
  options: { value: string; label: string }[];
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  icon: Icon,
  error,
  placeholderOption,
  options,
  id,
  className = '',
  ...props
}) => {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <div className="select-wrapper">
        {Icon && <Icon className="input-icon" />}
        <select
          id={id}
          className={`form-select ${error ? 'error' : ''} ${className}`}
          {...props}
        >
          {placeholderOption && (
            <option value="">{placeholderOption}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="select-arrow" />
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
