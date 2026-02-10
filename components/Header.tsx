
import React from 'react';
import { Search, MessageCircle } from 'lucide-react';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <header className="relative overflow-hidden bg-[#2aa7df] text-white">
      <div className="container mx-auto px-6 py-10 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight brand-font">Chris Fit</h1>

          <div className="w-full md:max-w-xl relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/70 group-focus-within:text-white transition-colors">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Buscar no catálogo (nome ou código)..."
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              className="w-full bg-white/20 border border-white/30 focus:border-white/60 outline-none rounded-full py-3 pl-12 pr-4 placeholder:text-white/60 text-white shadow-lg transition-all"
            />
          </div>

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
