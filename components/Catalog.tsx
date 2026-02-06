
import React, { useEffect, useMemo, useState } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CatalogProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
}

const Catalog: React.FC<CatalogProps> = ({ products, isLoading, error, searchTerm }) => {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [activeModal, setActiveModal] = useState<{ product: Product; image: string } | null>(null);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.code.includes(searchTerm)
      ),
    [products, searchTerm]
  );
  const featuredProducts = useMemo(
    () => products.filter((product) => product.isFeatured),
    [products]
  );
  const hasFeatured = featuredProducts.length > 0;
  const currentFeatured = hasFeatured ? featuredProducts[featuredIndex % featuredProducts.length] : null;
  const featuredImage = currentFeatured?.images?.find((image): image is string => Boolean(image));

  useEffect(() => {
    if (featuredIndex >= featuredProducts.length) {
      setFeaturedIndex(0);
    }
  }, [featuredIndex, featuredProducts.length]);

  const openModal = (product: Product, image: string) => {
    setActiveModal({ product, image });
  };

  const closeModal = () => setActiveModal(null);

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const getWhatsAppUrl = (product: Product) => {
    const whatsappNumber = '5511963554043';
    const message = encodeURIComponent(
      `Olá Chris! Vi no catálogo e tenho interesse no item: ${product.code} - ${product.name}`
    );
    return `https://wa.me/${whatsappNumber}?text=${message}`;
  };

  const renderPrice = (product: Product) => {
    const hasPromo = product.isPromo && product.promoPrice && product.promoPrice > 0;
    if (!hasPromo) {
      return <span className="text-3xl font-bold">{formatCurrency(product.price)}</span>;
    }
    return (
      <div className="flex flex-col">
        <span className="text-xs line-through text-white/70">{formatCurrency(product.price)}</span>
        <span className="text-3xl font-bold">{formatCurrency(product.promoPrice ?? product.price)}</span>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-700">
      <section className="mb-14" id="destaques">
        <div className="rounded-[32px] bg-gradient-to-r from-[#2aa7df] via-[#3fb5e8] to-[#42c2eb] text-white shadow-2xl overflow-hidden relative">
          <div className="relative z-10 px-8 md:px-14 py-10">
            <div className="flex items-center justify-between mb-6">
              <p className="uppercase tracking-[0.4em] text-xs opacity-70">destaques</p>
              {hasFeatured && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFeaturedIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length)
                    }
                    className="h-10 w-10 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/20 transition"
                    aria-label="Anterior"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFeaturedIndex((prev) => (prev + 1) % featuredProducts.length)
                    }
                    className="h-10 w-10 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/20 transition"
                    aria-label="Próximo"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>

            {currentFeatured ? (
              <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
                <div>
                  <h2 className="text-4xl md:text-5xl font-semibold leading-tight mb-4">
                    {currentFeatured.name}
                  </h2>
                  <p className="text-white/80 max-w-lg mb-6">
                    {currentFeatured.observation ??
                      'Peças pensadas para performance e estilo, com conforto para o dia inteiro e pronta entrega no WhatsApp.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    {renderPrice(currentFeatured)}
                    {currentFeatured.sizes.length ? (
                      <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em]">
                        {currentFeatured.sizes.map((size) => (
                          <span
                            key={`${currentFeatured.id}-size-${size}`}
                            className="rounded-full border border-white/40 px-3 py-1"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex justify-center lg:justify-end">
                  <div className="bg-white/15 rounded-[28px] p-6 backdrop-blur-sm max-w-sm w-full">
                    <button
                      type="button"
                      onClick={() => {
                        if (featuredImage && currentFeatured) {
                          openModal(currentFeatured, featuredImage);
                        }
                      }}
                      className="aspect-[4/3] bg-white rounded-3xl shadow-xl overflow-hidden flex items-center justify-center w-full"
                    >
                      {featuredImage ? (
                        <img
                          src={featuredImage}
                          alt={currentFeatured.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="text-[#1e90c8] font-semibold text-lg">
                          Adicione fotos para destacar
                        </div>
                      )}
                    </button>
                    {currentFeatured.images?.length ? (
                      <div className="mt-4 flex gap-3 justify-center">
                        {currentFeatured.images
                          .filter((image): image is string => Boolean(image))
                          .slice(0, 4)
                          .map((image, index) => (
                            <button
                              key={`${currentFeatured.id}-thumb-${index}`}
                              type="button"
                              onClick={() => openModal(currentFeatured, image)}
                              className="h-12 w-12 rounded-xl overflow-hidden border border-white/40"
                            >
                              <img src={image} alt="" className="h-full w-full object-cover" />
                            </button>
                          ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-white/80 text-sm">
                Marque itens como destaque no admin para exibir aqui.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mb-10" id="catalogo">
        <div className="mb-8">
          <p className="uppercase tracking-[0.4em] text-xs text-[#2aa7df] font-semibold">
            catálogo completo
          </p>
          <h3 className="text-3xl font-semibold text-[#0f1c2e]">Escolha o look ideal</h3>
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
              <ProductCard key={product.id} product={product} onPreview={openModal} />
            ))}
          </div>
        ) : (
          <div className="bg-white/30 backdrop-blur-sm rounded-3xl py-32 text-center border-2 border-dashed border-[#cfefff]">
            <div className="max-w-xs mx-auto text-[#2aa7df]/60">
              <p className="text-xl font-bold sport-font italic">Item não encontrado</p>
            </div>
          </div>
        )}
      </section>

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={closeModal}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden z-10">
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/90 flex items-center justify-center shadow"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-[#f3f9fd] flex items-center justify-center">
                <img
                  src={activeModal.image}
                  alt={activeModal.product.name}
                  className="w-full h-full object-contain max-h-[520px]"
                />
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-[#2aa7df] font-semibold">
                    {activeModal.product.code}
                  </p>
                  <h3 className="text-2xl font-semibold text-[#0f1c2e]">{activeModal.product.name}</h3>
                </div>
                <div className="text-[#0f1c2e]">
                  {activeModal.product.isPromo && activeModal.product.promoPrice ? (
                    <div className="flex flex-col">
                      <span className="text-xs line-through text-gray-400">
                        {formatCurrency(activeModal.product.price)}
                      </span>
                      <span className="text-2xl font-bold">
                        {formatCurrency(activeModal.product.promoPrice)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold">{formatCurrency(activeModal.product.price)}</span>
                  )}
                </div>
                {activeModal.product.observation && (
                  <p className="text-sm text-gray-500">{activeModal.product.observation}</p>
                )}
                <a
                  href={getWhatsAppUrl(activeModal.product)}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-2 bg-[#22c55e] text-white px-6 py-3 rounded-full font-bold shadow-lg"
                >
                  Pedir este item
                </a>
              </div>
            </div>
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
