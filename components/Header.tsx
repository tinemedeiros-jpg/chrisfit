
import React from 'react';
import { MessageCircle } from 'lucide-react';
import AppLogo from './AppLogo';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <header
      className="relative overflow-hidden bg-[#D05B92] text-white"
      style={{
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        zIndex: 100
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10">
        <div className="flex items-center justify-between gap-3">
          <AppLogo className="h-10 sm:h-14 w-auto min-w-0 text-white" />

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://www.instagram.com/chrisfit.princess"
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 w-12 rounded-full border border-white/40 flex items-center justify-center hover:bg-[#f4fbff]/20 transition-colors relative z-20"
              aria-label="Instagram @chrisfit.princess"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://wa.me/5511968268034"
              target="_blank"
              className="h-12 w-12 rounded-full border border-white/40 flex items-center justify-center hover:bg-[#f4fbff]/20 transition-colors relative z-20"
              aria-label="Contato no WhatsApp"
            >
              <MessageCircle size={22} fill="white" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
