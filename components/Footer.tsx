
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
    <footer className="bg-[#1a1a1a] text-white py-16 mt-20 relative overflow-hidden">
      {/* Decorative track lines in footer background */}
      <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-10 left-0 w-full h-1 bg-[#a15278] rotate-[-5deg]"></div>
        <div className="absolute top-20 left-0 w-full h-1 bg-[#a15278] rotate-[-5deg]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 items-center">
          
          {/* Brand Info */}
          <div className="text-center md:text-left">
            <h2 className="brand-font text-5xl mb-4 text-[#a15278]">Chris Fit</h2>
            <p className="opacity-50 text-sm max-w-xs mx-auto md:mx-0 sport-font tracking-widest italic mb-6 leading-relaxed">
              Consultora especializada em moda fitness para alta performance e estilo.
            </p>
          </div>

          {/* Enhanced PIX Info */}
          <div className="bg-[#a15278]/10 border border-[#a15278]/30 p-8 rounded-3xl backdrop-blur-md">
            <div className="flex items-center justify-center space-x-3 text-[#22c55e] mb-4">
              <CreditCard size={24} />
              <span className="font-bold sport-font tracking-wider text-lg">Pagamento PIX</span>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest opacity-40 mb-2 font-bold">Chave Celular</p>
              <div 
                onClick={copyPix}
                className="bg-black/40 p-4 rounded-2xl flex items-center justify-between cursor-pointer border border-white/5 hover:border-[#a15278]/50 transition-all group"
              >
                <span className="text-xl font-mono tracking-widest text-white">(11) 9.6355-4043</span>
                {copied ? <Check size={20} className="text-[#22c55e]" /> : <Copy size={20} className="opacity-30 group-hover:opacity-100 transition-opacity" />}
              </div>
              <p className="text-[10px] opacity-30 mt-3 uppercase font-bold tracking-[0.2em]">Clique no número para copiar</p>
            </div>
          </div>

          {/* Action Section - Centered WhatsApp Button */}
          <div className="flex justify-center">
            <a 
              href="https://wa.me/5511963554043" 
              target="_blank"
              className="inline-flex items-center space-x-3 bg-[#22c55e] text-white px-10 py-5 rounded-2xl font-bold hover:brightness-110 transition-all shadow-xl hover:shadow-[#22c55e]/20"
            >
              <Phone size={22} fill="white" />
              <span className="sport-font tracking-wide text-lg">Enviar Mensagem</span>
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
