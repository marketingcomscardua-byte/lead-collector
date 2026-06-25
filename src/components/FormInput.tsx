import React, { InputHTMLAttributes } from 'react';
import { LucideIcon, AlertCircle } from 'lucide-react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  icon: Icon,
  error,
  id,
  className = '',
  ...props
}) => {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <div className="input-icon-wrapper">
        {Icon && <Icon className="input-icon" />}
        <input
          id={id}
          className={`form-input ${error ? 'error' : ''} ${className}`}
          {...props}
        />
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
