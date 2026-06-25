import React, { useState, useCallback } from 'react';
import { X, User, Mail, Phone, Lock, LogOut, Check, Camera } from 'lucide-react';
import { Seller } from '../types/seller';
import { FormInput } from './FormInput';
import { AvatarPhotoModal } from './AvatarPhotoModal';

interface ProfileModalProps {
  seller: Seller;
  leadsCount: number;
  onClose: () => void;
  onUpdateSeller: (fields: Partial<Seller>) => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  seller,
  leadsCount,
  onClose,
  onUpdateSeller,
  onLogout,
}) => {
  // Profile fields state
  const [name, setName] = useState(seller.name);
  const [email, setEmail] = useState(seller.email || '');
  const [phone, setPhone] = useState(seller.phone);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Photo modal state — kept separate so it renders via portal above everything
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);
    setProfileError('');

    if (!name.trim()) {
      setProfileError('Nome completo é obrigatório.');
      return;
    }
    if (!phone.trim()) {
      setProfileError('Telefone é obrigatório.');
      return;
    }

    try {
      onUpdateSeller({ name, email, phone });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch {
      setProfileError('Erro ao atualizar perfil.');
    }
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(false);
    setPasswordError('');

    if (!newPassword) {
      setPasswordError('Digite a nova senha.');
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError('A senha deve ter no mínimo 4 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não conferem.');
      return;
    }

    try {
      onUpdateSeller({ password: newPassword });
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch {
      setPasswordError('Erro ao alterar senha.');
    }
  };

  const handleAvatarUpload = useCallback((dataUrl: string) => {
    onUpdateSeller({ avatar: dataUrl });
  }, [onUpdateSeller]);

  const handleAvatarRemove = useCallback(() => {
    onUpdateSeller({ avatar: undefined });
  }, [onUpdateSeller]);

  // Get initials for the fallback avatar circle
  const initials = seller.name
    ? seller.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'V';

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
          <header className="modal-header-nav">
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Perfil do Vendedor</span>
            <button className="modal-close-btn" onClick={onClose} aria-label="Fechar">
              <X size={20} />
            </button>
          </header>

          <div className="modal-body">
            {/* Hero details & stats */}
            <div className="profile-hero">
              {/* Clickable avatar — opens AvatarPhotoModal via portal */}
              <button
                type="button"
                className="profile-avatar-btn"
                onClick={() => setIsPhotoModalOpen(true)}
                aria-label="Alterar foto de perfil"
                title="Clique para alterar sua foto"
              >
                {seller.avatar ? (
                  <img
                    src={seller.avatar}
                    alt={`Foto de ${seller.name}`}
                    className="profile-avatar-img"
                  />
                ) : (
                  <div className="profile-avatar-circle">{initials}</div>
                )}
                {/* Camera overlay badge */}
                <div className="profile-avatar-camera-badge" aria-hidden="true">
                  <Camera size={14} />
                </div>
              </button>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{seller.name}</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: '-4px' }}>
                {seller.email || 'Sem e-mail cadastrado'}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                Empresa: {seller.companyName || 'Sem Empresa'}
              </p>
            </div>

            <div className="leads-counter-card">
              <div className="counter-value">{leadsCount}</div>
              <div className="counter-label">Leads Registrados</div>
            </div>

            {/* Edit Profile Form */}
            <form onSubmit={handleSaveProfile} className="modal-section-box">
              <h3 className="modal-section-title">Dados Pessoais</h3>

              <FormInput
                label="Nome Completo"
                id="profile-name"
                type="text"
                icon={User}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Mateus Hungaro"
              />

              <FormInput
                label="E-mail"
                id="profile-email"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: teste@123.com.br"
              />

              <FormInput
                label="Telefone"
                id="profile-phone"
                type="text"
                icon={Phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: (27) 99999-9999"
              />

              {profileError && <div className="error-message">{profileError}</div>}
              {profileSuccess && (
                <div className="success-banner">
                  <Check size={16} className="success-icon-check" />
                  Dados atualizados com sucesso!
                </div>
              )}

              <button type="submit" className="btn btn-primary">
                Salvar Perfil
              </button>
            </form>

            {/* Change Password Form */}
            <form onSubmit={handleSavePassword} className="modal-section-box">
              <h3 className="modal-section-title">Mudar Senha</h3>

              <FormInput
                label="Nova Senha"
                id="profile-new-password"
                type="password"
                icon={Lock}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
              />

              <FormInput
                label="Confirmar Senha"
                id="profile-confirm-password"
                type="password"
                icon={Lock}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
              />

              {passwordError && <div className="error-message">{passwordError}</div>}
              {passwordSuccess && (
                <div className="success-banner">
                  <Check size={16} className="success-icon-check" />
                  Senha alterada com sucesso!
                </div>
              )}

              <button type="submit" className="btn btn-primary">
                Alterar Senha
              </button>
            </form>

            {/* Logout button */}
            <button
              type="button"
              className="btn btn-danger-light"
              onClick={onLogout}
              style={{ marginTop: '0.5rem' }}
            >
              <LogOut size={20} />
              Sair da Conta
            </button>
          </div>
        </div>
      </div>

      {/* AvatarPhotoModal rendered via portal — completely outside scroll context */}
      {isPhotoModalOpen && (
        <AvatarPhotoModal
          currentAvatar={seller.avatar}
          sellerName={seller.name}
          onClose={() => setIsPhotoModalOpen(false)}
          onUpload={handleAvatarUpload}
          onRemove={handleAvatarRemove}
        />
      )}
    </>
  );
};
