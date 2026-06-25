import React, { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';
import { isIOS, isStandalone } from '../../utils/pwa';
import { InstallPwaModal } from './InstallPwaModal';

interface InstallPwaButtonProps {
  variant?: 'login' | 'profile' | 'admin';
}

export const InstallPwaButton: React.FC<InstallPwaButtonProps> = ({ variant = 'login' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [iosDevice, setIosDevice] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setShowButton(false);
      return;
    }

    const checkPwaStatus = () => {
      const isIos = isIOS();
      setIosDevice(isIos);
      
      // If iOS, we can always show the tutorial
      if (isIos) {
        setShowButton(true);
      } 
      // If Android/Desktop, show if deferredPrompt is available
      else if ((window as any).deferredPrompt) {
        setShowButton(true);
      } else {
        // Also show for generic Android / Chrome since they support standard menus, 
        // but we'll adapt to let the user know. In this setup, we'll display the button 
        // if they are on mobile even if prompt is not ready.
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent);
        if (isMobile) {
          setShowButton(true);
        } else {
          setShowButton(false);
        }
      }
    };

    checkPwaStatus();

    const handlePromptReady = () => {
      setShowButton(true);
    };

    const handleInstalled = () => {
      setShowButton(false);
    };

    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  if (!showButton) return null;

  const handleInstallClick = () => {
    setIsModalOpen(true);
  };

  const triggerNativePrompt = async () => {
    const promptEvent = (window as any).deferredPrompt;
    if (!promptEvent) {
      // If prompt isn't available but user clicked (e.g. custom Android Chrome guidance fallback)
      alert("Para instalar, toque no menu de três pontos do seu navegador Chrome e selecione 'Adicionar à tela inicial'.");
      return;
    }
    
    // Show the install prompt
    promptEvent.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await promptEvent.userChoice;
    console.log(`[PWA] Escolha do usuário para a instalação: ${outcome}`);
    
    // We've used the prompt, and can't use it again
    (window as any).deferredPrompt = null;
    setShowButton(false);
  };

  if (variant === 'profile') {
    return (
      <>
        <button
          type="button"
          className="btn btn-outline"
          onClick={handleInstallClick}
          style={{ 
            width: '100%', 
            height: '46px', 
            marginTop: '0.85rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px' 
          }}
        >
          <Smartphone size={18} />
          Adicionar app à tela inicial
        </button>
        <InstallPwaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          isIOS={iosDevice}
          onInstall={triggerNativePrompt}
        />
      </>
    );
  }

  if (variant === 'admin') {
    return (
      <>
        <button
          type="button"
          className="admin-install-button"
          onClick={handleInstallClick}
        >
          <Smartphone size={16} />
          Instalar App
        </button>
        <InstallPwaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          isIOS={iosDevice}
          onInstall={triggerNativePrompt}
        />
      </>
    );
  }

  // Default 'login' variant
  return (
    <>
      <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
        <button
          type="button"
          className="btn btn-outline"
          onClick={handleInstallClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            height: '44px',
            padding: '0 1.25rem',
            borderColor: 'rgba(8, 59, 138, 0.2)',
            color: 'var(--primary)',
            backgroundColor: '#fff',
            width: '100%',
            justifyContent: 'center',
            borderRadius: '12px'
          }}
        >
          <Smartphone size={16} />
          Instalar app no celular
        </button>
      </div>
      <InstallPwaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isIOS={iosDevice}
        onInstall={triggerNativePrompt}
      />
    </>
  );
};
