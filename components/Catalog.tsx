
import React, { useEffect, useMemo, useState } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { X } from 'lucide-react';

interface CatalogProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
}

const Catalog: React.FC<CatalogProps> = ({ products, isLoading, error, searchTerm }) => {
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
  const featuredDisplay = useMemo(() => featuredProducts.slice(0, 10), [featuredProducts]);
  const [activeFeaturedIndex, setActiveFeaturedIndex] = useState(0);
  const hasFeatured = featuredProducts.length > 0;
  const modalImages = activeModal?.product.images?.filter((image): image is string => Boolean(image)) ?? [];
  const featuredLayers = useMemo(() => {
    if (!featuredDisplay.length) return [];
    return featuredDisplay.map((_, offset) => featuredDisplay[(activeFeaturedIndex + offset) % featuredDisplay.length]);
  }, [featuredDisplay, activeFeaturedIndex]);

  useEffect(() => {
    if (featuredDisplay.length <= 1) return undefined;
    const interval = window.setInterval(() => {
      setActiveFeaturedIndex((current) => (current + 1) % featuredDisplay.length);
    }, 10000);

    return () => window.clearInterval(interval);
  }, [featuredDisplay.length]);

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

  return (
    <div className="animate-in fade-in duration-700">
      <section className="mb-14" id="destaques">
        <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-gradient-to-r from-[#2aa7df] via-[#3fb5e8] to-[#42c2eb] text-white shadow-2xl overflow-hidden">
          <div className="relative z-10 px-6 md:px-14 py-12">
            <p className="uppercase tracking-[0.4em] text-xs opacity-70">destaques</p>

            {hasFeatured ? (
              <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start mt-8">
                <div className="space-y-6">
                  <h2 className="text-4xl md:text-5xl font-semibold leading-tight">
                    Seleção em destaque
                  </h2>
                  <p className="text-white/80 max-w-lg">
                    Peças escolhidas para performance e estilo. A vitrine muda automaticamente
                    a cada 10 segundos para mostrar novas combinações.
                  </p>
                  {featuredLayers[0] && (
                    <div className="space-y-4 max-w-md">
                      <div className="border border-white/40 bg-white/10 px-4 py-3 uppercase tracking-[0.4em] text-[11px] font-semibold">
                        {featuredLayers[0].code}
                      </div>
                      <div>
                        <p className="text-2xl font-semibold">{featuredLayers[0].name}</p>
                        <div className="mt-3">
                          {featuredLayers[0].isPromo && featuredLayers[0].promoPrice ? (
                            <div className="flex flex-col">
                              <span className="text-xs line-through text-white/60">
                                {formatCurrency(featuredLayers[0].price)}
                              </span>
                              <span className="text-3xl font-semibold">
                                {formatCurrency(featuredLayers[0].promoPrice)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-3xl font-semibold">
                              {formatCurrency(featuredLayers[0].price)}
                            </span>
                          )}
                        </div>
                      </div>
                      {featuredLayers[0].sizes.length > 0 && (
                        <div className="text-xs uppercase tracking-[0.3em] text-white/70">
                          Tamanhos: {featuredLayers[0].sizes.join(' • ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="relative min-h-[340px] flex items-start justify-center lg:justify-end">
                  <div className="relative w-full max-w-2xl overflow-hidden">
                    {featuredLayers.map((product, index) => {
                      const featuredImage = product.images?.find((image): image is string => Boolean(image));
                      const depth = index;
                      const widthOffset = depth * 90;
                      const translateX = depth * 40;
                      const translateY = depth * 24;
                      const scale = Math.max(0.68, 1 - depth * 0.06);
                      const isActive = index === 0;
                      return (
                        <button
                          key={`${product.id}-stack-${index}`}
                          type="button"
                          onClick={() => {
                            if (featuredImage) {
                              openModal(product, featuredImage);
                            }
                          }}
                          className={`absolute top-0 left-0 w-full text-[#0f1c2e] shadow-2xl overflow-hidden border border-white/40 transition-all duration-700 ${
                            isActive ? 'bg-white/95' : 'bg-[#d5d9df]/70'
                          } ${!isActive ? 'hidden md:block' : ''}`}
                          style={{
                            width: `calc(100% - ${widthOffset}px)`,
                            transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                            zIndex: featuredLayers.length - index
                          }}
                        >
                          {featuredImage ? (
                            <img
                              src={featuredImage}
                              alt={product.name}
                              className={`w-full h-64 md:h-72 object-cover transition-all duration-700 ${
                                isActive ? 'filter-none' : 'grayscale opacity-60'
                              }`}
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-64 md:h-72 flex items-center justify-center text-[#1e90c8] font-semibold">
                              Adicione fotos para destacar
                            </div>
                          )}
                          <div className="px-5 py-4 border-t border-[#d7effa] flex items-center justify-between gap-4">
                            <span className="font-semibold">{product.name}</span>
                            <span className="text-lg font-bold text-[#1e90c8]">
                              {formatCurrency(product.isPromo && product.promoPrice ? product.promoPrice : product.price)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-white/80 text-sm mt-6">
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
          <div className="bg-white/70 py-24 text-center border border-[#cfefff]">
            <p className="text-[#2aa7df] font-bold sport-font italic">Carregando catálogo...</p>
          </div>
        ) : error ? (
          <div className="bg-white/70 py-24 text-center border border-red-200">
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
          <div className="bg-white/30 backdrop-blur-sm py-32 text-center border-2 border-dashed border-[#cfefff]">
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
        <div className="relative bg-white shadow-2xl max-w-3xl w-full overflow-hidden z-10">
            <div className="absolute top-0 left-0 right-0 h-14 bg-[#2aa7df] flex items-center justify-between px-6 text-white z-10">
              <span className="text-[11px] uppercase tracking-[0.4em] font-semibold">
                {activeModal.product.code}
              </span>
              <button
                type="button"
                onClick={closeModal}
                className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-[#f3f9fd] flex flex-col items-center justify-center z-20">
                <img
                  src={activeModal.image}
                  alt={activeModal.product.name}
                  className="w-full h-full object-contain max-h-[520px]"
                />
                {modalImages.length > 1 && (
                  <div className="w-full px-4 pb-4">
                    <div className="flex items-center justify-center gap-2 bg-white/80 p-3 shadow-sm">
                      {modalImages.map((image, index) => (
                        <button
                          key={`${activeModal.product.id}-modal-thumb-${index}`}
                          type="button"
                          onClick={() => setActiveModal({ product: activeModal.product, image })}
                          className={`h-14 w-14 rounded-xl overflow-hidden border transition ${
                            image === activeModal.image
                              ? 'border-[#2aa7df] ring-2 ring-[#2aa7df]/40'
                              : 'border-white/70 hover:border-[#2aa7df]/60'
                          }`}
                          aria-label={`Foto ${index + 1}`}
                        >
                          <img src={image} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 pt-20 flex flex-col gap-4">
                <div>
                  <h3 className="text-2xl font-semibold text-[#0f1c2e]">{activeModal.product.name}</h3>
                </div>
                <div className="text-[#0f1c2e]">
                  {activeModal.product.isPromo && activeModal.product.promoPrice ? (
                    <div className="flex flex-col">
                      <span className="text-xs line-through text-gray-400">
                        {formatCurrency(activeModal.product.price)}
                      </span>
                      <span className="text-3xl font-bold">
                        {formatCurrency(activeModal.product.promoPrice)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold">{formatCurrency(activeModal.product.price)}</span>
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
      )}
    </div>
  );
};

export default Catalog;
