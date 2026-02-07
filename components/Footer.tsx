
import React, { useState } from 'react';
import { Phone, CreditCard, Copy, Check } from 'lucide-react';

const Footer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const pixKey = "11963554043";

  const copyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="bg-[#0b1b2b] text-white py-16 mt-20" id="contato">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 items-start">
          <div className="space-y-4">
            <h2 className="brand-font text-5xl text-white">Chris Fit</h2>
            <div className="flex gap-3 text-xs uppercase tracking-[0.3em] text-white/50">
              <span>Moda</span>
              <span>•</span>
              <span>Performance</span>
              <span>•</span>
              <span>Entrega rápida</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 backdrop-blur-md">
            <div className="flex items-center justify-center space-x-3 text-[#22c55e] mb-4">
              <CreditCard size={24} />
              <span className="font-bold sport-font tracking-wider text-lg">Pagamento PIX</span>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest opacity-40 mb-2 font-bold">Chave Celular</p>
              <div
                onClick={copyPix}
                className="bg-black/40 p-4 flex items-center justify-between cursor-pointer border border-white/10 hover:border-[#2aa7df]/50 transition-all group"
              >
                <span className="text-xl font-mono tracking-widest text-white">(11) 9.6355-4043</span>
                {copied ? (
                  <Check size={20} className="text-[#22c55e]" />
                ) : (
                  <Copy size={20} className="opacity-30 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
              <p className="text-[10px] opacity-40 mt-3 uppercase font-bold tracking-[0.2em]">
                Clique no número para copiar
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-6">
            <a
              href="https://wa.me/5511963554043"
              target="_blank"
              className="inline-flex items-center space-x-3 bg-[#22c55e] text-white px-10 py-5 rounded-2xl font-bold hover:brightness-110 transition-all shadow-xl hover:shadow-[#22c55e]/20"
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
