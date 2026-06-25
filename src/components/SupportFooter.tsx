import React from 'react';
import { MessageSquare } from 'lucide-react';

export const SupportFooter: React.FC = () => {
  const whatsappUrl = 'https://wa.me/5527995293341?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20no%20Coletor%20de%20Leads.';

  return (
    <footer className="footer-support">
      <div className="flex-col align-center gap-1">
        <span className="footer-brand">Grupo Scardua</span>
        <span className="footer-text">Desenvolvido pelo Marketing do Grupo Scardua</span>
      </div>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-support w-full"
      >
        <MessageSquare size={20} fill="#FFFFFF" />
        Precisando de Suporte?
      </a>
    </footer>
  );
};
