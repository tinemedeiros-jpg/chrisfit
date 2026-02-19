
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

          <a
            href="https://wa.me/5511968268034"
            target="_blank"
            className="h-12 w-12 shrink-0 rounded-full border border-white/40 flex items-center justify-center hover:bg-[#f4fbff]/20 transition-colors relative z-20"
            aria-label="Contato no WhatsApp"
          >
            <MessageCircle size={22} fill="white" />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
