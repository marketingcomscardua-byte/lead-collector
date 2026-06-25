import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ImagePlus, Trash2 } from 'lucide-react';

interface AvatarPhotoModalProps {
  currentAvatar?: string;
  sellerName: string;
  onClose: () => void;
  onUpload: (dataUrl: string) => void;
  onRemove: () => void;
}

export const AvatarPhotoModal: React.FC<AvatarPhotoModalProps> = ({
  currentAvatar,
  sellerName,
  onClose,
  onUpload,
  onRemove,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecione uma imagem válida.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        onUpload(dataUrl);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onRemove();
    onClose();
  };

  // Get initials as fallback preview
  const initials = sellerName
    ? sellerName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'V';

  const modal = (
    <div
      className="photo-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Alterar foto de perfil"
    >
      <div
        className="photo-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />

        {/* Header */}
        <div className="photo-modal-header">
          <span className="photo-modal-title">Alterar foto de perfil</span>
          <button
            type="button"
            className="photo-modal-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current avatar preview */}
        <div className="photo-modal-preview">
          {currentAvatar ? (
            <img
              src={currentAvatar}
              alt={`Foto de ${sellerName}`}
              className="photo-modal-img"
            />
          ) : (
            <div className="photo-modal-initials-preview">{initials}</div>
          )}
        </div>

        {/* Action buttons */}
        <div className="photo-modal-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus size={18} />
            Escolher imagem
          </button>

          {currentAvatar && (
            <button
              type="button"
              className="btn btn-danger-light"
              onClick={handleRemove}
            >
              <Trash2 size={18} />
              Remover foto
            </button>
          )}

          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>

        <p className="photo-modal-hint">
          Formatos aceitos: JPG, PNG, WebP. Tamanho máximo: 5MB.
        </p>
      </div>
    </div>
  );

  // Render via portal so it sits directly on document.body,
  // completely outside any scrollable/transformed parent container.
  return createPortal(modal, document.body);
};
