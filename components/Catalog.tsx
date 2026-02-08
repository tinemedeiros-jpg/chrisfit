
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
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const hasFeatured = featuredProducts.length > 0;
  const modalImages = activeModal?.product.images?.filter((image): image is string => Boolean(image)) ?? [];
  const featuredLayers = useMemo(() => {
    if (!featuredDisplay.length) return [];
    return featuredDisplay.map((_, offset) => featuredDisplay[(activeFeaturedIndex + offset) % featuredDisplay.length]);
  }, [featuredDisplay, activeFeaturedIndex]);
  const activeFeaturedImage = featuredLayers[0]?.images?.find(
    (image): image is string => Boolean(image)
  );
  const tileClipPath = 'polygon(12% 0, 100% 0, 88% 100%, 0 100%)';

  useEffect(() => {
    if (featuredDisplay.length <= 1) return undefined;
    const interval = window.setInterval(() => {
      setActiveFeaturedIndex((current) =>
        isCarouselPaused ? current : (current + 1) % featuredDisplay.length
      );
    }, 10000);

    return () => window.clearInterval(interval);
  }, [featuredDisplay.length, isCarouselPaused]);

  const sideImages = featuredLayers
    .slice(1)
    .map((product) => ({
      product,
      image: product.images?.find((image): image is string => Boolean(image)) ?? null
    }))
    .filter((entry) => Boolean(entry.image));

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
      <section className="text-white" id="destaques">
        <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-[#2aa7df]">
          <div className="relative z-10 px-6 md:px-14 pt-10 pb-8">
            <p className="uppercase tracking-[0.4em] text-xs text-white/80">destaques</p>
          </div>

          {hasFeatured ? (
            <div
              className="relative w-full overflow-visible bg-[#2aa7df] shadow-[0_-10px_25px_rgba(0,0,0,0.2),0_16px_30px_rgba(0,0,0,0.25)]"
              onMouseEnter={() => setIsCarouselPaused(true)}
              onMouseLeave={() => setIsCarouselPaused(false)}
            >
              <div className="relative z-10 flex flex-col lg:h-[360px] lg:flex-row">
                <div
                  className="relative z-20 flex flex-col justify-center px-6 py-10 text-right sm:px-10 lg:w-1/3 lg:py-0"
                  style={{ clipPath: tileClipPath, WebkitClipPath: tileClipPath }}
                >
                  <span className="absolute right-8 top-6 text-[10px] font-bold uppercase tracking-[0.25em] text-white/90">
                    destaques
                  </span>
                  {featuredLayers[0] && (
                    <div className="mt-12 flex w-full flex-col items-end gap-4">
                      <div className="flex h-[60px] flex-col items-end gap-1">
                        {featuredLayers[0].isPromo && featuredLayers[0].promoPrice ? (
                          <>
                            <span className="text-sm text-white/60 line-through whitespace-nowrap">
                              {formatCurrency(featuredLayers[0].price)}
                            </span>
                            <span className="text-4xl font-bold leading-none whitespace-nowrap">
                              {formatCurrency(featuredLayers[0].promoPrice)}
                            </span>
                          </>
                        ) : (
                          <span className="text-4xl font-bold leading-none whitespace-nowrap">
                            {formatCurrency(featuredLayers[0].price)}
                          </span>
                        )}
                      </div>
                      <div className="flex h-[70px] w-full items-center justify-end">
                        <span
                          className="text-right text-xl font-light tracking-[0.4em] text-white"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {featuredLayers[0].name}
                        </span>
                      </div>
                      {featuredLayers[0].sizes.length > 0 && (
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90 whitespace-nowrap">
                          Tamanhos: {featuredLayers[0].sizes.join(' • ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="relative h-72 sm:h-80 md:h-96 lg:h-full lg:w-1/3 overflow-visible px-6 sm:px-10">
                  <div className="relative flex h-full w-full flex-col justify-end">
                    {featuredLayers[0] && activeFeaturedImage && (
                      <button
                        type="button"
                        onClick={() => {
                          openModal(featuredLayers[0], activeFeaturedImage);
                        }}
                        className="group absolute left-0 right-0 top-0 mx-auto w-full"
                        style={{
                          height: 'calc(100% - 64px)',
                          transform: 'translateY(-40px)'
                        }}
                      >
                        <div
                          className="relative h-full w-full overflow-hidden"
                          style={{ clipPath: tileClipPath, WebkitClipPath: tileClipPath }}
                        >
                          <img
                            src={activeFeaturedImage}
                            alt={featuredLayers[0].name}
                            className="h-full w-full object-cover shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-transform duration-500 group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                        </div>
                      </button>
                    )}

                    <div className="relative z-20 flex items-center justify-center gap-2 pb-6">
                      {featuredDisplay.map((product, index) => (
                        <button
                          key={`${product.id}-nav-${index}`}
                          type="button"
                          onClick={() => setActiveFeaturedIndex(index)}
                          className={`h-[5px] w-4 skew-x-[-20deg] transition-all ${
                            index === activeFeaturedIndex ? 'bg-white/80 w-[22px]' : 'bg-white/25 hover:bg-white/40'
                          }`}
                          aria-label={`Ir para ${product.name}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative hidden h-72 sm:h-80 md:h-96 lg:flex lg:w-1/3 lg:h-full lg:flex-col">
                  {sideImages.length > 0 ? (
                    sideImages.map(({ product, image }, index) => (
                      <button
                        key={`${product.id}-stack-${index}`}
                        type="button"
                        onClick={() => {
                          const nextIndex = featuredDisplay.findIndex((item) => item.id === product.id);
                          if (nextIndex >= 0) {
                            setActiveFeaturedIndex(nextIndex);
                          }
                        }}
                        className="relative flex-1 overflow-hidden"
                        style={{ clipPath: tileClipPath, WebkitClipPath: tileClipPath }}
                      >
                        {image && (
                          <img
                            src={image}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        )}
                        <span className="absolute inset-0 bg-black/45" />
                      </button>
                    ))
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/70">
                      Sem outras imagens
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="px-6 pb-10 text-white/80 text-sm">
              Marque itens como destaque no admin para exibir aqui.
            </div>
          )}
        </div>
      </section>

      <section className="container mx-auto mb-10 px-4 py-10" id="catalogo">
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
