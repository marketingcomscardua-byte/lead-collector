import React from 'react';
import { X, Download, Share, Plus, Smartphone } from 'lucide-react';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
  onInstall: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({
  isOpen,
  onClose,
  isIOS,
  onInstall,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-sheet" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '420px', borderRadius: '16px' }}
      >
        <header className="modal-header-nav">
          <span style={{ fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smartphone size={20} style={{ color: 'var(--primary)' }} />
            Instalar Lead Collector
          </span>
          <button className="modal-close-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ textAlign: 'center' }}>
            <img 
              src="/assets/brand/lead-collector-avatar.png" 
              alt="Lead Collector Avatar" 
              style={{ width: '80px', height: '80px', borderRadius: '20px', marginBottom: '1rem', boxShadow: 'var(--shadow-md)' }} 
            />
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: '1.4' }}>
              Adicione o aplicativo à sua tela inicial para um acesso rápido e estável durante os eventos.
            </p>
          </div>

          {isIOS ? (
            <div 
              style={{ 
                background: 'var(--bg-light)', 
                padding: '1rem', 
                borderRadius: '12px', 
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <h4 style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)' }}>
                Como instalar no iPhone
              </h4>
              <ol style={{ paddingLeft: '1.1rem', margin: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--primary-dark)' }}>
                <li>Abra este app pelo navegador <strong>Safari</strong>.</li>
                <li>
                  Toque no botão de <strong>Compartilhar</strong> 
                  <span style={{ display: 'inline-flex', verticalAlign: 'middle', margin: '0 4px', color: '#007aff' }}>
                    <Share size={16} />
                  </span>.
                </li>
                <li>Role a lista e toque em <strong>“Adicionar à Tela de Início”</strong>.</li>
                <li>Confirme tocando em <strong>“Adicionar”</strong> no canto superior direito.</li>
              </ol>
              <p style={{ fontSize: '0.75rem', color: 'var(--danger)', margin: 0, fontWeight: 500 }}>
                Atenção: A instalação do PWA no iOS é permitida apenas utilizando o Safari.
              </p>
            </div>
          ) : (
            <div 
              style={{ 
                background: 'var(--bg-light)', 
                padding: '1rem', 
                borderRadius: '12px', 
                border: '1px solid var(--border)' 
              }}
            >
              <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--primary-dark)', lineHeight: '1.4' }}>
                Clique no botão abaixo para instalar diretamente no seu celular (Android / Chrome ou Windows / Chrome / Edge).
              </p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            {!isIOS && (
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => {
                  onInstall();
                  onClose();
                }}
                style={{ width: '100%', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Download size={18} />
                Instalar agora
              </button>
            )}
            
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={onClose}
              style={{ width: '100%', height: '46px' }}
            >
              {isIOS ? 'Entendi' : 'Fechar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
