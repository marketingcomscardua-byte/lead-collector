import React from 'react';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  activeEventName?: string;
  activeSellerName?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentPage,
  onPageChange,
  activeEventName,
  activeSellerName
}) => {
  return (
    <div className="app-container">
      <Navigation
        currentPage={currentPage}
        onPageChange={onPageChange}
        activeEventName={activeEventName}
        activeSellerName={activeSellerName}
      />
      
      <main className="main-content-wrapper">
        <div className="main-content">
          {children}
        </div>
      </main>

      <style>{`
        .main-content-wrapper {
          margin-left: 260px; /* Offset for desktop sidebar */
          min-height: 100vh;
          transition: margin var(--transition-normal);
          background-color: var(--bg-main);
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 768px) {
          .main-content-wrapper {
            margin-left: 0;
            padding-top: 60px; /* Offset for mobile header */
            padding-bottom: 64px; /* Offset for mobile bottom nav */
          }
        }
      `}</style>
    </div>
  );
};
