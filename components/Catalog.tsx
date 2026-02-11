
import React, { useEffect, useMemo, useState } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { X, Search } from 'lucide-react';

interface CatalogProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const Catalog: React.FC<CatalogProps> = ({ products, isLoading, error, searchTerm, onSearchChange }) => {
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
  const [displayIndex, setDisplayIndex] = useState(0); // Índice da imagem base (atualiza após animação)
  const [hasStartedCarousel, setHasStartedCarousel] = useState(false); // Controla se já começou o carrossel
  const hasFeatured = featuredProducts.length > 0;

  // Detecta mudança no índice e anima (mas não na primeira vez)
  useEffect(() => {
    if (!hasFeatured || featuredDisplay.length <= 1 || !hasStartedCarousel) return;

    setIsAnimating(true);

    // Calcula tempo total: última imagem da fila tem delay de (N-1) * 50ms + 500ms de animação
    const queueCount = featuredDisplay.length - 1; // Número de imagens na fila
    const lastDelay = queueCount * 50; // Delay da última imagem
    const totalTime = lastDelay + 500; // Tempo total até última animação terminar

    const timeout = setTimeout(() => {
      setIsAnimating(false);
      setDisplayIndex(activeFeaturedIndex); // Atualiza a base APÓS animação
    }, totalTime);

    return () => clearTimeout(timeout);
  }, [activeFeaturedIndex, hasFeatured, featuredDisplay.length, hasStartedCarousel]);
  const modalImages = activeModal?.product.images?.filter((image): image is string => Boolean(image)) ?? [];

  // featuredLayers usa displayIndex (não activeFeaturedIndex) para a base
  const featuredLayers = useMemo(() => {
    if (!featuredDisplay.length) return [];
    return featuredDisplay.map((_, offset) => featuredDisplay[(displayIndex + offset) % featuredDisplay.length]);
  }, [featuredDisplay, displayIndex]);

  // nextLayers usa activeFeaturedIndex para a próxima que vai entrar
  const nextLayers = useMemo(() => {
    if (!featuredDisplay.length) return [];
    return featuredDisplay.map((_, offset) => featuredDisplay[(activeFeaturedIndex + offset) % featuredDisplay.length]);
  }, [featuredDisplay, activeFeaturedIndex]);
  const activeFeaturedImage = featuredLayers[0]?.images?.find(
    (image): image is string => Boolean(image)
  );

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
      setHasStartedCarousel(true); // Marca que o carrossel começou
      setActiveFeaturedIndex((current) =>
        isCarouselPaused ? current : (current + 1) % featuredDisplay.length
      );
    }, 8000);

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
        <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-[#D05B92]">
          {hasFeatured ? (
            <div
              className="relative w-full h-[360px] bg-[#D05B92]"
              style={{
                boxShadow: '0 -10px 25px rgba(0,0,0,0.3)'
              }}
              onMouseEnter={() => setIsCarouselPaused(true)}
              onMouseLeave={() => setIsCarouselPaused(false)}
            >
              {/* IMAGEM FLUTUANTE - sobre a faixa, alinhada à coluna 2 */}
              <div
                className="absolute bottom-0 overflow-hidden"
                style={{
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '223px',
                  height: '396px',
                  zIndex: 100
                }}
              >
                {/* Imagem atual - PARADA (usa displayIndex) */}
                {featuredLayers[0] && (
                  <button
                    type="button"
                    onClick={() => {
                      const img = featuredLayers[0].images?.find((i): i is string => Boolean(i));
                      if (img) openModal(featuredLayers[0], img);
                    }}
                    className="absolute inset-0 w-full h-full"
                    style={{ zIndex: 1 }}
                  >
                    <img
                      src={featuredLayers[0].images?.find((i): i is string => Boolean(i)) ?? ''}
                      alt={featuredLayers[0].name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                )}

                {/* Próxima imagem - DESLIZA por cima (usa activeFeaturedIndex) */}
                {nextLayers[0] && (
                  <button
                    type="button"
                    onClick={() => {
                      const img = nextLayers[0].images?.find((i): i is string => Boolean(i));
                      if (img) openModal(nextLayers[0], img);
                    }}
                    className="absolute inset-0 w-full h-full"
                    style={{
                      zIndex: 2,
                      transform: isAnimating ? 'translateX(0)' : 'translateX(100%)',
                      transition: isAnimating ? 'transform 500ms ease-in-out' : 'none',
                      transitionDelay: isAnimating ? '0ms' : '0ms'
                    }}
                  >
                    <img
                      src={nextLayers[0].images?.find((i): i is string => Boolean(i)) ?? ''}
                      alt={nextLayers[0].name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                )}
              </div>

              {/* 4 COLUNAS: 40% | 20% | 20% | 20% */}
              <div className="flex h-full">
                {/* COLUNA 1: TEXTO - 40% dividida em 4 linhas */}
                <div className="w-[40%] flex flex-col px-10">
                  {/* LINHA 1: Destaques - 15% */}
                  <div className="h-[15%] flex items-center justify-end text-right">
                    <p className="uppercase tracking-[0.4em] text-xs text-white/90">destaques</p>
                  </div>

                  {/* LINHA 2: Preço - 25% */}
                  <div className="h-[25%] flex items-center justify-end text-right">
                    {featuredDisplay[activeFeaturedIndex] && (
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
                    )}
                  </div>

                  {/* LINHA 3: Nome - 45% */}
                  <div className="h-[45%] flex items-center justify-end text-right">
                    {featuredDisplay[activeFeaturedIndex] && (
                      <span className="text-xl font-light tracking-[0.4em] text-white">
                        {featuredDisplay[activeFeaturedIndex].name}
                      </span>
                    )}
                  </div>

                  {/* LINHA 4: Tamanhos - 15% */}
                  <div className="h-[15%] flex items-center justify-end text-right">
                    {featuredDisplay[activeFeaturedIndex] && featuredDisplay[activeFeaturedIndex].sizes.length > 0 && (
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
                        {featuredDisplay[activeFeaturedIndex].sizes.join(' . ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* COLUNA 2: IMAGEM ATIVA - 20% */}
                <div className="w-[20%] relative overflow-hidden">
                  {/* Imagem atual - PARADA (usa displayIndex, muda só após animação) */}
                  {featuredLayers[0] && (
                    <button
                      type="button"
                      onClick={() => {
                        const img = featuredLayers[0].images?.find((i): i is string => Boolean(i));
                        if (img) openModal(featuredLayers[0], img);
                      }}
                      className="absolute inset-0 w-full h-full"
                      style={{ zIndex: 1 }}
                    >
                      <img
                        src={featuredLayers[0].images?.find((i): i is string => Boolean(i)) ?? ''}
                        alt={featuredLayers[0].name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )}

                  {/* Próxima imagem - DESLIZA por cima (usa activeFeaturedIndex) */}
                  {nextLayers[0] && (
                    <button
                      type="button"
                      onClick={() => {
                        const img = nextLayers[0].images?.find((i): i is string => Boolean(i));
                        if (img) openModal(nextLayers[0], img);
                      }}
                      className="absolute inset-0 w-full h-full"
                      style={{
                        zIndex: 2,
                        transform: isAnimating ? 'translateX(0)' : 'translateX(100%)',
                        transition: isAnimating ? 'transform 500ms ease-in-out' : 'none',
                        transitionDelay: isAnimating ? '0ms' : '0ms'
                      }}
                    >
                      <img
                        src={nextLayers[0].images?.find((i): i is string => Boolean(i)) ?? ''}
                        alt={nextLayers[0].name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )}
                </div>

                {/* COLUNA 3: FILA DE IMAGENS - 20% */}
                <div className="w-[20%] flex">
                  {featuredLayers.slice(1).map((product, idx) => {
                    const image = product.images?.find((img): img is string => Boolean(img));
                    const nextProduct = nextLayers[idx + 1]; // Usa nextLayers para próximas
                    const nextImage = nextProduct?.images?.find((img): img is string => Boolean(img));

                    if (!image) return null;

                    return (
                      <div key={`queue-${product.id}`} className="flex-1 h-full relative overflow-hidden">
                        {/* Imagem atual - PARADA (usa featuredLayers/displayIndex) */}
                        <button
                          type="button"
                          onClick={() => {
                            const targetIndex = featuredDisplay.findIndex((p) => p.id === product.id);
                            if (targetIndex >= 0) {
                              setActiveFeaturedIndex(targetIndex);
                            }
                          }}
                          className="absolute inset-0 w-full h-full"
                          style={{ zIndex: 1 }}
                        >
                          <img
                            src={image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50" />
                        </button>

                        {/* Próxima imagem - DESLIZA por cima (usa nextLayers/activeFeaturedIndex) */}
                        {nextImage && (
                          <button
                            type="button"
                            onClick={() => {
                              const targetIndex = featuredDisplay.findIndex((p) => p.id === nextProduct.id);
                              if (targetIndex >= 0) {
                                setActiveFeaturedIndex(targetIndex);
                              }
                            }}
                            className="absolute inset-0 w-full h-full"
                            style={{
                              zIndex: 2,
                              transform: isAnimating ? 'translateX(0)' : 'translateX(100%)',
                              transition: isAnimating ? 'transform 500ms ease-in-out' : 'none',
                              transitionDelay: isAnimating ? `${(idx + 1) * 50}ms` : '0ms'
                            }}
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
                    );
                  })}
                </div>

                {/* COLUNA 4: VAZIA - 20% */}
                <div className="w-[20%]" />
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

              {/* Overlay com sombra por cima de tudo */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: 'inset 0 -16px 30px rgba(0,0,0,0.25)',
                  zIndex: 1000
                }}
              />
            </div>
          ) : (
            <div className="px-6 py-10 text-white/80 text-sm">
              Marque itens como destaque no admin para exibir aqui.
            </div>
          )}
        </div>
      </section>

      <section className="container mx-auto mb-10 px-4 py-10" id="catalogo">
        <div className="mb-8 flex items-center justify-between gap-6">
          <div>
            <p className="uppercase tracking-[0.4em] text-xs text-[#D05B92] font-semibold">
              catálogo completo
            </p>
            <h3 className="text-3xl font-semibold text-[#0f1c2e]">Escolha o look ideal</h3>
          </div>

          <div className="w-full max-w-md relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#D05B92]/70 group-focus-within:text-[#D05B92] transition-colors">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Buscar no catálogo..."
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              className="w-full bg-white border border-[#D05B92]/30 focus:border-[#D05B92] outline-none rounded-full py-3 pl-12 pr-4 placeholder:text-gray-400 text-[#0f1c2e] shadow-sm transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white/70 py-24 text-center border border-[#FFE8F5]">
            <p className="text-[#D05B92] font-bold sport-font italic">Carregando catálogo...</p>
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
          <div className="bg-white/30 backdrop-blur-sm py-32 text-center border-2 border-dashed border-[#FFE8F5]">
            <div className="max-w-xs mx-auto text-[#D05B92]/60">
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
            <div className="absolute top-0 left-0 right-0 h-14 bg-[#D05B92] flex items-center justify-between px-6 text-white z-10">
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
              <div className="bg-[#FFF5F9] flex flex-col items-center justify-center z-20">
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
                              ? 'border-[#D05B92] ring-2 ring-[#D05B92]/40'
                              : 'border-white/70 hover:border-[#D05B92]/60'
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
