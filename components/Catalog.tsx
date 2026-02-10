
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
  const [isAnimating, setIsAnimating] = useState(false);
  const hasFeatured = featuredProducts.length > 0;
  const modalImages = activeModal?.product.images?.filter((image): image is string => Boolean(image)) ?? [];
  const featuredLayers = useMemo(() => {
    if (!featuredDisplay.length) return [];
    return featuredDisplay.map((_, offset) => featuredDisplay[(activeFeaturedIndex + offset) % featuredDisplay.length]);
  }, [featuredDisplay, activeFeaturedIndex]);
  const activeFeaturedImage = featuredLayers[0]?.images?.find(
    (image): image is string => Boolean(image)
  );

  // Detecta mudança no índice e anima
  useEffect(() => {
    if (!hasFeatured || featuredDisplay.length <= 1) return;

    // Inicia animação
    setIsAnimating(true);

    // Após 500ms, reseta SECO
    const timeout = setTimeout(() => {
      setIsAnimating(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [activeFeaturedIndex, hasFeatured, featuredDisplay.length]);

  // Geometria para 15° de inclinação
  // Para altura de 360px: offset = 360 * tan(15°) ≈ 96px
  // Em porcentagem da largura da coluna (~467px em tela 1400px): 96/467 ≈ 20.5%
  // Usando 12% como valor visual mais suave baseado na referência
  const skewOffset = '12%';
  const SKEW_DEG = 15;
  const stripHeight = 360;

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
      {/* SEÇÃO DE DESTAQUES - ESTRUTURA SIMPLES */}
      <section className="text-white" id="destaques">
        <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-[#2aa7df]">
          {hasFeatured ? (
            <div
              className="relative w-full h-[360px] bg-[#2aa7df]"
              onMouseEnter={() => setIsCarouselPaused(true)}
              onMouseLeave={() => setIsCarouselPaused(false)}
            >
              {/* 3 COLUNAS SIMPLES */}
              <div className="flex h-full">
                {/* COLUNA 1: TEXTO - sempre mostra info do item ativo */}
                <div className="w-1/3 flex flex-col justify-center items-end px-10 text-right">
                  <p className="uppercase tracking-[0.4em] text-xs text-white/90 mb-6">destaques</p>

                  {featuredDisplay[activeFeaturedIndex] && (
                    <div className="flex flex-col items-end gap-3 transition-opacity duration-500">
                      {/* Preço */}
                      <div className="flex flex-col items-end">
                        {featuredDisplay[activeFeaturedIndex].isPromo &&
                         featuredDisplay[activeFeaturedIndex].promoPrice ? (
                          <>
                            <span className="text-sm text-white/60 line-through">
                              {formatCurrency(featuredDisplay[activeFeaturedIndex].price)}
                            </span>
                            <span className="text-4xl font-bold leading-none">
                              {formatCurrency(featuredDisplay[activeFeaturedIndex].promoPrice)}
                            </span>
                          </>
                        ) : (
                          <span className="text-4xl font-bold leading-none">
                            {formatCurrency(featuredDisplay[activeFeaturedIndex].price)}
                          </span>
                        )}
                      </div>

                      {/* Nome */}
                      <span className="text-xl font-light tracking-[0.4em] text-white">
                        {featuredDisplay[activeFeaturedIndex].name}
                      </span>

                      {/* Tamanhos */}
                      {featuredDisplay[activeFeaturedIndex].sizes.length > 0 && (
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
                          {featuredDisplay[activeFeaturedIndex].sizes.join(' . ')}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* COLUNA 2: IMAGEM ATIVA - 2 imagens (atual + próxima) */}
                <div className="w-1/3 flex items-center justify-center overflow-hidden">
                  <div
                    className="flex flex-shrink-0 h-full"
                    style={{
                      width: '200%',
                      transform: isAnimating ? 'translate(-50%, 0)' : 'translate(0, 0)',
                      transition: isAnimating ? 'transform 500ms ease-in-out' : 'none'
                    }}
                  >
                    {/* Imagem 1: Atual */}
                    {featuredLayers[0] && (
                      <button
                        type="button"
                        onClick={() => {
                          const img = featuredLayers[0].images?.find((i): i is string => Boolean(i));
                          if (img) openModal(featuredLayers[0], img);
                        }}
                        className="w-1/2 h-full flex-shrink-0"
                      >
                        <img
                          src={featuredLayers[0].images?.find((i): i is string => Boolean(i)) ?? ''}
                          alt={featuredLayers[0].name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    )}
                    {/* Imagem 2: Próxima */}
                    {featuredLayers[1] && (
                      <button
                        type="button"
                        onClick={() => {
                          const img = featuredLayers[1].images?.find((i): i is string => Boolean(i));
                          if (img) openModal(featuredLayers[1], img);
                        }}
                        className="w-1/2 h-full flex-shrink-0"
                      >
                        <img
                          src={featuredLayers[1].images?.find((i): i is string => Boolean(i)) ?? ''}
                          alt={featuredLayers[1].name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    )}
                  </div>
                </div>

                {/* COLUNA 3: FILA DE IMAGENS - cada uma com 2 imagens (atual + próxima) */}
                <div className="w-1/3 flex">
                  {featuredLayers.slice(1).map((product, idx) => {
                    const image = product.images?.find((img): img is string => Boolean(img));
                    const nextProduct = featuredLayers[idx + 2]; // Próximo produto na fila
                    const nextImage = nextProduct?.images?.find((img): img is string => Boolean(img));

                    if (!image) return null;

                    return (
                      <div key={`queue-${product.id}`} className="flex-1 h-full overflow-hidden relative">
                        <div
                          className="flex h-full"
                          style={{
                            width: '200%',
                            transform: isAnimating ? 'translate(-50%, 0)' : 'translate(0, 0)',
                            transition: isAnimating ? 'transform 500ms ease-in-out' : 'none'
                          }}
                        >
                          {/* Imagem 1: Atual */}
                          <button
                            type="button"
                            onClick={() => {
                              const targetIndex = featuredDisplay.findIndex((p) => p.id === product.id);
                              if (targetIndex >= 0) {
                                setActiveFeaturedIndex(targetIndex);
                              }
                            }}
                            className="w-1/2 h-full flex-shrink-0 relative"
                          >
                            <img
                              src={image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50" />
                          </button>

                          {/* Imagem 2: Próxima */}
                          {nextImage && (
                            <button
                              type="button"
                              onClick={() => {
                                const targetIndex = featuredDisplay.findIndex((p) => p.id === nextProduct.id);
                                if (targetIndex >= 0) {
                                  setActiveFeaturedIndex(targetIndex);
                                }
                              }}
                              className="w-1/2 h-full flex-shrink-0 relative"
                            >
                              <img
                                src={nextImage}
                                alt={nextProduct.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dots do carrossel */}
              {featuredDisplay.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-2">
                  {featuredDisplay.map((product, index) => (
                    <button
                      key={`${product.id}-dot-${index}`}
                      type="button"
                      onClick={() => setActiveFeaturedIndex(index)}
                      className={`h-1 transition-all duration-300 ${
                        index === activeFeaturedIndex
                          ? 'bg-white w-6'
                          : 'bg-white/50 hover:bg-white/70 w-4'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="px-6 py-10 text-white/80 text-sm">
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
