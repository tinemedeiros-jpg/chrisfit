
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
            <AppLogo className="h-10 w-auto text-white" />
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
              className="inline-flex items-center space-x-3 bg-[#BA4680] text-white px-10 py-5 rounded-2xl font-bold hover:brightness-110 transition-all shadow-xl hover:shadow-[#BA4680]/20 border-2 border-white/20"
            >
              <Phone size={22} fill="white" />
              <span className="sport-font tracking-wide text-lg">Enviar Mensagem</span>
            </a>
            <div className="text-xs uppercase tracking-[0.3em] text-white/40 text-center md:text-right">
              atendimento de segunda a sábado
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
