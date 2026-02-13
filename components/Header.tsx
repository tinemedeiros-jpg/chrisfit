
import React from 'react';
import { MessageCircle } from 'lucide-react';

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
          <h1 className="font-semibold tracking-tight brand-font text-[2.7rem] sm:text-[4.06875rem] leading-none min-w-0">Chris Fit</h1>

          <a
            href="https://wa.me/5511963554043"
            target="_blank"
            className="h-12 w-12 shrink-0 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/20 transition-colors relative z-20"
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
