
import React, { useState } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { Search } from 'lucide-react';

interface CatalogProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

const Catalog: React.FC<CatalogProps> = ({ products, isLoading, error }) => {
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code.includes(search)
  );

  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-16 max-w-xl mx-auto relative group">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-[#a15278]/40 group-focus-within:text-[#a15278] transition-colors">
          <Search size={24} />
        </div>
        <input 
          type="text" 
          placeholder="Buscar no catálogo (nome ou código)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border-2 border-transparent focus:border-[#a15278]/20 outline-none rounded-2xl py-5 pl-16 pr-8 shadow-2xl transition-all text-[#a15278] font-medium"
        />
      </div>

      {isLoading ? (
        <div className="bg-white/70 rounded-3xl py-24 text-center border border-[#a15278]/10">
          <p className="text-[#a15278] font-bold sport-font italic">Carregando catálogo...</p>
        </div>
      ) : error ? (
        <div className="bg-white/70 rounded-3xl py-24 text-center border border-red-200">
          <p className="text-red-500 font-bold sport-font italic">Não foi possível carregar os produtos.</p>
          <p className="text-xs text-gray-400 mt-2">{error}</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="catalog-grid">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white/30 backdrop-blur-sm rounded-3xl py-32 text-center border-2 border-dashed border-[#a15278]/20">
          <div className="max-w-xs mx-auto text-[#a15278]/40">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl font-bold sport-font italic">Item não encontrado</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
