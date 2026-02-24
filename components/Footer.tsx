
import React, { useState } from 'react';
import { Phone, CreditCard, Copy, Check } from 'lucide-react';
import AppLogo from './AppLogo';

const Footer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const pixKey = "11968268034";

  const copyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer
      className="bg-[#D05B92] text-white py-16 relative"
      style={{
        boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.5)',
        zIndex: 50
      }}
      id="contato"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 items-start">
          <div className="space-y-4">
            <AppLogo className="h-20 w-auto text-white" />
            <div className="flex gap-3 text-xs uppercase tracking-[0.3em] text-white/50">
              <span>Moda</span>
              <span>•</span>
              <span>Performance</span>
              <span>•</span>
              <span>Entrega agendada</span>
            </div>
          </div>

          <div className="bg-[#f4fbff]/5 border border-white/10 p-5 backdrop-blur-md">
            <div className="flex items-center justify-center space-x-3 text-white mb-3">
              <CreditCard size={22} />
              <span className="font-bold sport-font tracking-wider text-base">Pagamento PIX</span>
            </div>
            <div className="text-center">
              <div
                onClick={copyPix}
                className="bg-black/40 p-3 flex items-center justify-between cursor-pointer border border-white/10 hover:border-white/30 transition-all group"
              >
                <span className="text-lg font-mono tracking-widest text-white">(11) 968268034</span>
                {copied ? (
                  <Check size={18} className="text-white" />
                ) : (
                  <Copy size={18} className="opacity-30 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
              <p className="text-[10px] opacity-40 mt-2 uppercase font-bold tracking-[0.2em]">
                Clique no número para copiar
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-6">
            <a
              href="https://wa.me/5511968268034"
              target="_blank"
              className="inline-flex items-center space-x-3 bg-[#BA4680] text-white px-6 py-3 rounded-2xl font-bold hover:brightness-110 transition-all shadow-xl hover:shadow-[#BA4680]/20 border-2 border-white/20"
            >
              <Phone size={18} fill="white" />
              <span className="sport-font tracking-wide text-base">Enviar Mensagem</span>
            </a>
            <a
              href="https://www.instagram.com/chrisfit.princess"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-3 bg-[#BA4680] text-white px-6 py-3 rounded-2xl font-bold hover:brightness-110 transition-all shadow-xl hover:shadow-[#BA4680]/20 border-2 border-white/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="sport-font tracking-wide text-base">@chrisfit.princess</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
