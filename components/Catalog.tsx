
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

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.includes(search)
  );
  const featuredProduct = products[0];

  return (
    <div className="animate-in fade-in duration-700">
      <section className="mb-14" id="destaques">
        <div className="rounded-[32px] bg-gradient-to-r from-[#2aa7df] via-[#3fb5e8] to-[#42c2eb] text-white shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -left-10 top-10 text-[140px] font-black tracking-tight text-white/40">
              CHRIS
            </div>
            <div className="absolute left-1/3 top-24 text-[160px] font-black tracking-tight text-white/30">
              FIT
            </div>
          </div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center px-8 md:px-14 py-12">
            <div>
              <p className="uppercase tracking-[0.4em] text-xs opacity-70 mb-4">
                destaque da semana
              </p>
              <h2 className="text-4xl md:text-5xl font-semibold leading-tight mb-4">
                {featuredProduct ? featuredProduct.name : 'Coleção Chris Fit'}
              </h2>
              <p className="text-white/80 max-w-lg mb-6">
                {featuredProduct?.observation ??
                  'Peças pensadas para performance e estilo, com conforto para o dia inteiro e pronta entrega no WhatsApp.'}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="text-3xl font-bold">
                  {featuredProduct
                    ? `R$ ${featuredProduct.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : 'Consulte valores'}
                </div>
                {featuredProduct?.sizes?.length ? (
                  <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em]">
                    {featuredProduct.sizes.map((size) => (
                      <span
                        key={`${featuredProduct.id}-size-${size}`}
                        className="rounded-full border border-white/40 px-3 py-1"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="mt-8 flex items-center gap-4">
                <button className="bg-white text-[#2199d1] font-bold px-6 py-3 rounded-full shadow-lg hover:brightness-95 transition">
                  Comprar
                </button>
                <button className="bg-white/20 border border-white/40 px-6 py-3 rounded-full uppercase tracking-[0.3em] text-xs font-semibold">
                  Ver detalhes
                </button>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="bg-white/15 rounded-[28px] p-6 backdrop-blur-sm max-w-sm w-full">
                <div className="aspect-[4/3] bg-white rounded-3xl shadow-xl overflow-hidden flex items-center justify-center">
                  {featuredProduct?.images?.[0] ? (
                    <img
                      src={featuredProduct.images[0]}
                      alt={featuredProduct.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-[#1e90c8] font-semibold text-lg">
                      Adicione fotos para destacar
                    </div>
                  )}
                </div>
                {featuredProduct?.images?.length ? (
                  <div className="mt-4 flex gap-3 justify-center">
                    {featuredProduct.images
                      .filter((image): image is string => Boolean(image))
                      .slice(0, 4)
                      .map((image, index) => (
                        <div
                          key={`${featuredProduct.id}-thumb-${index}`}
                          className="h-12 w-12 rounded-xl overflow-hidden border border-white/40"
                        >
                          <img src={image} alt="" className="h-full w-full object-cover" />
                        </div>
                      ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10" id="catalogo">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <p className="uppercase tracking-[0.4em] text-xs text-[#2aa7df] font-semibold">
              catálogo completo
            </p>
            <h3 className="text-3xl font-semibold text-[#0f1c2e]">Escolha o look ideal</h3>
          </div>

          <div className="max-w-xl w-full relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-[#2aa7df]/70 group-focus-within:text-[#1e90c8] transition-colors">
              <Search size={22} />
            </div>
            <input
              type="text"
              placeholder="Buscar no catálogo (nome ou código)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#e5f3fb] focus:border-[#2aa7df]/50 outline-none rounded-2xl py-4 pl-14 pr-6 shadow-lg transition-all text-[#0f1c2e] font-medium"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white/70 rounded-3xl py-24 text-center border border-[#cfefff]">
            <p className="text-[#2aa7df] font-bold sport-font italic">Carregando catálogo...</p>
          </div>
        ) : error ? (
          <div className="bg-white/70 rounded-3xl py-24 text-center border border-red-200">
            <p className="text-red-500 font-bold sport-font italic">Não foi possível carregar os produtos.</p>
            <p className="text-xs text-gray-400 mt-2">{error}</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="catalog-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white/30 backdrop-blur-sm rounded-3xl py-32 text-center border-2 border-dashed border-[#cfefff]">
            <div className="max-w-xs mx-auto text-[#2aa7df]/60">
              <Search size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-xl font-bold sport-font italic">Item não encontrado</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Catalog;
