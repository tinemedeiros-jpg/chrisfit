
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="pt-12 pb-8 text-center relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-8">
          <h1 className="brand-font text-[#a15278] text-8xl md:text-9xl select-none leading-none drop-shadow-md">
            Chris Fit
          </h1>
          <p className="text-[#a15278] uppercase tracking-[0.3em] font-bold text-sm mt-4 opacity-80 sport-font italic">
            consultora de roupa fit
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
