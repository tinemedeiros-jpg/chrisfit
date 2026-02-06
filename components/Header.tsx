
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-[#2aa7df] via-[#36b0e5] to-[#46c0ec] text-white">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -left-24 top-10 text-[160px] font-black tracking-tight text-white/40">
          FIT
        </div>
        <div className="absolute left-1/3 top-32 text-[120px] font-black tracking-tight text-white/20">
          CHRIS
        </div>
      </div>

      <div className="container mx-auto px-6 py-10 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-2xl font-black">
              CF
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight brand-font">Chris Fit</h1>
              <p className="text-xs uppercase tracking-[0.35em] opacity-80 sport-font">
                catálogo esportivo premium
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.3em] font-semibold">
            <a className="hover:text-white/80 transition-colors" href="#">Home</a>
            <a className="hover:text-white/80 transition-colors" href="#destaques">Destaques</a>
            <a className="hover:text-white/80 transition-colors" href="#catalogo">Catálogo</a>
            <a className="hover:text-white/80 transition-colors" href="#contato">Contato</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button className="h-10 w-10 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/20 transition-colors">
              <span className="text-sm font-semibold">🔍</span>
            </button>
            <button className="h-10 w-10 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/20 transition-colors">
              <span className="text-sm font-semibold">🛍️</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
