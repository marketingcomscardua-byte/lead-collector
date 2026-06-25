import React, { useState } from 'react';
import { User, Lock, LogIn, AlertCircle } from 'lucide-react';
import { FormInput } from '../components/FormInput';
import { leadCollectorStorage } from '../storage/leadCollectorStorage';
import { Seller } from '../types/seller';
import { InstallPwaButton } from '../components/common/InstallPwaButton';

interface LoginPageProps {
  onLoginSuccess: (seller: Seller) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!usernameOrEmail.trim()) {
      setError('Por favor, informe seu usuário ou e-mail.');
      return;
    }
    if (!password) {
      setError('Por favor, insira sua senha.');
      return;
    }

    const sellers = leadCollectorStorage.getSellers();

    const seller = sellers.find(
      (s) =>
        (s.username === usernameOrEmail.trim() || s.email === usernameOrEmail.trim()) &&
        s.password === password
    );

    if (seller) {
      if (seller.status === 'Inativo') {
        setError('Este usuário está inativo.');
        return;
      }
      leadCollectorStorage.setCurrentSellerId(seller.id);
      onLoginSuccess(seller);
    } else {
      setError('Usuário/E-mail ou senha incorretos.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="login-card">

          {/* Logo / Icon */}
          <div className="login-logo-wrap">
            <div className="login-brand">
              <img src="/assets/brand/lead-collector-logo.svg" alt="Lead Collector" className="logo-horizontal" />
            </div>
            <h1 className="login-title">Bem-vindo de volta</h1>
            <p className="login-subtitle">Faça login para acessar o sistema</p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="login-form">
            <FormInput
              label="E-mail ou usuário"
              id="login-username"
              type="text"
              icon={User}
              placeholder="Digite seu e-mail ou usuário"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
            />

            <FormInput
              label="Senha"
              id="login-password"
              type="password"
              icon={Lock}
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <div className="error-message" style={{ marginTop: '0.25rem' }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary login-submit-btn">
              <LogIn size={20} />
              Entrar
            </button>
          </form>

          <InstallPwaButton variant="login" />
        </div>
        <p className="login-credit">
          Desenvolvido por Mateus Hungaro
        </p>
      </div>
    </div>
  );
};
