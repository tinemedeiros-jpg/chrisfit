
import React from 'react';
import { Search, MessageCircle } from 'lucide-react';

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
      <div className="container mx-auto px-6 py-10 relative z-10">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold tracking-tight brand-font" style={{ fontSize: '4.06875rem', lineHeight: '1' }}>Chris Fit</h1>

          <a
            href="https://wa.me/5511963554043"
            target="_blank"
            className="h-12 w-12 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/20 transition-colors"
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
