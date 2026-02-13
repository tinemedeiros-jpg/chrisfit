
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { X, Search, Play } from 'lucide-react';
import { isVideoUrl, getVideoMimeType } from '../lib/mediaUtils';

interface CatalogProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const Catalog: React.FC<CatalogProps> = ({ products, isLoading, error, searchTerm, onSearchChange }) => {
  const [activeModal, setActiveModal] = useState<{ product: Product; image: string; initialImage: string } | null>(null);
  const [sortOrder, setSortOrder] = useState<'code' | 'name' | 'recent' | 'promo'>('code');

  const filteredProducts = useMemo(() => {
    const filtered = products.filter(
      (product) =>
        product.isActive !== false &&
        (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.includes(searchTerm))
    );

    // Aplica ordenação
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'promo':
          // Promoções primeiro, depois por código
          if (a.isPromo && !b.isPromo) return -1;
          if (!a.isPromo && b.isPromo) return 1;
          return a.code.localeCompare(b.code);
        case 'code':
        default:
          return a.code.localeCompare(b.code);
      }
    });

    return sorted;
  }, [products, searchTerm, sortOrder]);
  const featuredProducts = useMemo(
    () => products.filter((product) => product.isFeatured && product.isActive !== false),
    [products]
  );
  const featuredDisplay = useMemo(() => featuredProducts.slice(0, 10), [featuredProducts]);
  const [activeFeaturedIndex, setActiveFeaturedIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(0); // Índice da imagem base (atualiza após animação)
  const [hasStartedCarousel, setHasStartedCarousel] = useState(false); // Controla se já começou o carrossel
  const hasFeatured = featuredProducts.length > 0;

  // Refs para controlar vídeos no carousel
  const floatingVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const mainVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const queueVideoRefs = React.useRef<(HTMLVideoElement | null)[]>([]);

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
  ) ?? null;
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

  // Controla play/pause dos vídeos no carousel featured
  useEffect(() => {
    // Play nos vídeos ativos (displayIndex)
    if (floatingVideoRef.current && isVideoUrl(activeFeaturedImage)) {
      floatingVideoRef.current.play().catch(() => {});
    }
    if (mainVideoRef.current && isVideoUrl(activeFeaturedImage)) {
      mainVideoRef.current.play().catch(() => {});
    }
  }, [activeFeaturedImage, displayIndex]);

  const sideImages = featuredLayers
    .slice(1)
    .map((product) => ({
      product,
      image: product.images?.find((image): image is string => Boolean(image)) ?? null
    }))
    .filter((entry) => Boolean(entry.image));

  const openModal = (product: Product, image: string) => {
    setActiveModal({ product, image, initialImage: image });
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
        <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-[#BA4680]">
          {hasFeatured ? (
            <div
              className="relative w-full h-[320px] md:h-[360px] bg-[#BA4680]"
              style={{
                boxShadow: '0 -10px 25px rgba(0,0,0,0.3)'
              }}
              onMouseEnter={() => setIsCarouselPaused(true)}
              onMouseLeave={() => setIsCarouselPaused(false)}
            >
              <div className="md:hidden h-full p-5 flex flex-col justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const img = featuredDisplay[activeFeaturedIndex]?.images?.find((i): i is string => Boolean(i));
                    if (img) openModal(featuredDisplay[activeFeaturedIndex], img);
                  }}
                  className="relative mx-auto h-[190px] w-[107px] overflow-hidden shadow-xl"
                >
                  {activeFeaturedImage && isVideoUrl(activeFeaturedImage) ? (
                    <video
                      src={activeFeaturedImage}
                      className="h-full w-full object-cover"
                      muted
                      loop
                      playsInline
                      autoPlay
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={activeFeaturedImage}
                      alt={featuredDisplay[activeFeaturedIndex]?.name ?? 'Destaque'}
                      className="h-full w-full object-cover"
                    />
                  )}
                </button>

                <div className="text-center text-white">
                  <p className="uppercase tracking-[0.35em] text-[10px] text-white/85 mb-2">destaques</p>
                  <h3 className="text-lg font-semibold leading-tight">
                    {featuredDisplay[activeFeaturedIndex]?.name}
                  </h3>
                  <p className="text-2xl font-bold mt-2">
                    {featuredDisplay[activeFeaturedIndex]
                      ? formatCurrency(
                          featuredDisplay[activeFeaturedIndex].isPromo && featuredDisplay[activeFeaturedIndex].promoPrice
                            ? featuredDisplay[activeFeaturedIndex].promoPrice
                            : featuredDisplay[activeFeaturedIndex].price
                        )
                      : ''}
                  </p>
                </div>
              </div>

              <div className="hidden md:block">
              {/* IMAGEM FLUTUANTE - sobre a faixa, alinhada à coluna 2 */}
              <div
                className="absolute bottom-0 overflow-hidden"
                style={{
                  left: '50%',
                  transform: 'translateX(-50%) translateY(20px) rotate(4deg)',
                  width: '270.6px',
                  height: '480.7px',
                  zIndex: 1100,
                  boxShadow: '-2px -4px 15px rgba(0,0,0,0.25), 4px 8px 35px rgba(0,0,0,0.4)'
                }}
              >
                {/* Imagem/Vídeo atual - PARADA (usa displayIndex) */}
                {featuredLayers[0] && (() => {
                  const media = featuredLayers[0].images?.find((i): i is string => Boolean(i)) ?? '';
                  const isVideo = isVideoUrl(media);
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        const img = featuredLayers[0].images?.find((i): i is string => Boolean(i));
                        if (img) openModal(featuredLayers[0], img);
                      }}
                      className="absolute inset-0 w-full h-full"
                      style={{ zIndex: 1 }}
                    >
                      {isVideo ? (
                        <video
                          ref={floatingVideoRef}
                          src={media}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                          autoPlay
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={media}
                          alt={featuredLayers[0].name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  );
                })()}

                {/* Próxima imagem/vídeo - DESLIZA por cima (usa activeFeaturedIndex) */}
                {nextLayers[0] && (() => {
                  const media = nextLayers[0].images?.find((i): i is string => Boolean(i)) ?? '';
                  const isVideo = isVideoUrl(media);
                  return (
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
                      {isVideo ? (
                        <video
                          src={media}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={media}
                          alt={nextLayers[0].name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  );
                })()}
              </div>

              {/* 3 COLUNAS: 40% | 20% | 40% */}
              <div className="flex h-full">
                {/* COLUNA 1: TEXTO - 40% dividida em 4 linhas */}
                <div className="w-[40%] flex flex-col px-10">
                  {/* LINHA 1: Destaques - 15% */}
                  <div className="h-[15%] flex items-center justify-end text-right pt-[30px]">
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
                            <div className="font-bold leading-none">
                              <span className="text-2xl">R$ </span>
                              <span className="text-6xl">
                                {featuredDisplay[activeFeaturedIndex].promoPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="font-bold leading-none">
                            <span className="text-2xl">R$ </span>
                            <span className="text-6xl">
                              {featuredDisplay[activeFeaturedIndex].price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* LINHA 3: Nome - dinâmica, cresce conforme conteúdo */}
                  <div className="flex-grow flex items-start justify-end text-right pt-4">
                    {featuredDisplay[activeFeaturedIndex] && (
                      <h3 className="text-2xl font-semibold leading-tight text-white">
                        {featuredDisplay[activeFeaturedIndex].name}
                      </h3>
                    )}
                  </div>

                  {/* LINHA 4: Tamanhos - próxima ao nome */}
                  <div className="pb-[30px] flex items-end justify-end text-right">
                    {featuredDisplay[activeFeaturedIndex] && featuredDisplay[activeFeaturedIndex].sizes.length > 0 && (
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
                        {featuredDisplay[activeFeaturedIndex].sizes.join(' . ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* COLUNA 2: IMAGEM/VÍDEO ATIVA - 20% */}
                <div className="w-[20%] relative overflow-hidden">
                  {/* Mídia atual - PARADA (usa displayIndex, muda só após animação) */}
                  {featuredLayers[0] && (() => {
                    const media = featuredLayers[0].images?.find((i): i is string => Boolean(i)) ?? '';
                    const isVideo = isVideoUrl(media);
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          const img = featuredLayers[0].images?.find((i): i is string => Boolean(i));
                          if (img) openModal(featuredLayers[0], img);
                        }}
                        className="absolute inset-0 w-full h-full"
                        style={{ zIndex: 1 }}
                      >
                        {isVideo ? (
                          <video
                            ref={mainVideoRef}
                            src={media}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            playsInline
                            autoPlay
                            preload="metadata"
                          />
                        ) : (
                          <img
                            src={media}
                            alt={featuredLayers[0].name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </button>
                    );
                  })()}

                  {/* Próxima mídia - DESLIZA por cima (usa activeFeaturedIndex) */}
                  {nextLayers[0] && (() => {
                    const media = nextLayers[0].images?.find((i): i is string => Boolean(i)) ?? '';
                    const isVideo = isVideoUrl(media);
                    return (
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
                        {isVideo ? (
                          <video
                            src={media}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            playsInline
                            preload="metadata"
                          />
                        ) : (
                          <img
                            src={media}
                            alt={nextLayers[0].name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </button>
                    );
                  })()}
                </div>

                {/* COLUNA 3: FILA DE IMAGENS - 40% */}
                <div className="w-[40%] flex">
                  {featuredLayers.slice(1).map((product, idx) => {
                    const image = product.images?.find((img): img is string => Boolean(img));
                    const nextProduct = nextLayers[idx + 1]; // Usa nextLayers para próximas
                    const nextImage = nextProduct?.images?.find((img): img is string => Boolean(img));

                    if (!image) return null;

                    return (
                      <div key={`queue-${product.id}`} className="flex-1 h-full relative overflow-hidden">
                        {/* Mídia atual - PARADA (usa featuredLayers/displayIndex) */}
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
                          {isVideoUrl(image) ? (
                            <video
                              src={image}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              playsInline
                              autoPlay
                              preload="metadata"
                            />
                          ) : (
                            <img
                              src={image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/50" />
                        </button>

                        {/* Próxima mídia - DESLIZA por cima (usa nextLayers/activeFeaturedIndex) */}
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
                            {isVideoUrl(nextImage) ? (
                              <video
                                src={nextImage}
                                className="w-full h-full object-cover"
                                muted
                                loop
                                playsInline
                                preload="metadata"
                              />
                            ) : (
                              <img
                                src={nextImage}
                                alt={nextProduct.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute inset-0 bg-black/50" />
                          </button>
                        )}
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

              {/* Overlay com sombra por cima de tudo */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: 'inset 0 -16px 30px rgba(0,0,0,0.25)',
                  zIndex: 1000
                }}
              />
              </div>
            </div>
          ) : (
            <div className="px-6 py-10 text-white/80 text-sm">
              Marque itens como destaque no admin para exibir aqui.
            </div>
          )}
        </div>
      </section>

      <section className="container mx-auto mb-10 px-4 py-10" id="catalogo">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="uppercase tracking-[0.4em] text-xs text-[#D05B92] font-semibold">
              catálogo completo
            </p>
            <h3 className="text-3xl font-semibold text-[#0f1c2e]">Escolha o look ideal</h3>
          </div>

          <div className="w-full md:max-w-md relative group">
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

        {/* Dropdown de ordenação */}
        <div className="mb-6 flex justify-end">
          <div className="relative">
            <label htmlFor="sort-order" className="text-xs text-[#BA4680] uppercase tracking-wider mr-3">
              Ordenar por:
            </label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'code' | 'name' | 'recent' | 'promo')}
              className="bg-white border border-[#D05B92]/30 text-[#BA4680] rounded-full px-4 py-2 text-sm font-semibold focus:outline-none focus:border-[#D05B92] cursor-pointer shadow-sm hover:shadow-md transition-all"
            >
              <option value="code">Código</option>
              <option value="name">Nome</option>
              <option value="recent">Mais Recente</option>
              <option value="promo">Promoções</option>
            </select>
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
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-2 sm:p-4 lg:p-8" role="dialog">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={closeModal}
            aria-hidden="true"
          />
          {/* Modal fixa e responsiva: mantém campo 9:16 sem estourar viewport */}
          <div
            className="relative z-[1201] shadow-2xl overflow-hidden bg-[#f4fbff] w-full max-w-[1120px] max-h-[95vh] lg:max-h-[calc(100vh-3rem)] flex flex-col lg:flex-row"
          >
            {/* Lado esquerdo: Imagem com tag de código */}
            <div
              className="relative flex-shrink-0 w-full lg:w-auto"
              style={{
                aspectRatio: '9/16',
                height: 'min(56vh, 720px)',
                maxHeight: 'calc(95vh - 12rem)'
              }}
            >
              {/* Tag de código - aba externa superior esquerda */}
              <div className="absolute -left-3 top-6 z-30">
                <div className="bg-[#D05B92] px-4 py-2 shadow-lg">
                  <span className="text-white text-[11px] uppercase tracking-[0.4em] font-semibold pl-2">
                    {activeModal.product.code}
                  </span>
                </div>
              </div>

              {/* Container da imagem/vídeo */}
              <div className="relative w-full h-full bg-black overflow-hidden">
                {/* Fundo embaçado se a mídia não preencher */}
                <div className="absolute inset-0">
                  {isVideoUrl(activeModal.image) ? (
                    <video
                      src={activeModal.image}
                      className="w-full h-full object-cover blur-xl brightness-50"
                      muted
                      loop
                      playsInline
                      autoPlay
                      preload="metadata"
                    />
                  ) : (
                    <div
                      className="w-full h-full bg-cover bg-center blur-xl brightness-50"
                      style={{ backgroundImage: `url(${activeModal.image})` }}
                    />
                  )}
                </div>

                {/* Mídia principal nítida */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {isVideoUrl(activeModal.image) ? (
                    <video
                      src={activeModal.image}
                      controls
                      className="w-full h-full object-contain"
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={activeModal.image}
                      alt={activeModal.product.name}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Lado direito: Área branca com informações */}
            <div className="relative bg-[#f4fbff] flex flex-col w-full lg:min-w-[360px] lg:max-w-[520px] lg:rounded-tr-[2rem]">
              {/* Botão fechar - canto superior direito */}
              <button
                type="button"
                onClick={closeModal}
                className="absolute top-4 right-4 lg:top-6 lg:right-6 h-9 w-9 rounded-full bg-[#D05B92] flex items-center justify-center hover:brightness-110 transition z-10"
                aria-label="Fechar"
              >
                <X size={16} className="text-white" />
              </button>

              {/* Conteúdo scrollável */}
              <div className="flex-1 overflow-y-auto p-5 lg:p-8 pt-14 lg:pt-16 flex flex-col">
                {/* Nome do produto */}
                <div className="mb-4">
                  <h3 className="text-xl lg:text-2xl font-semibold text-[#BA4680]">{activeModal.product.name}</h3>
                </div>

                {/* Preço */}
                <div className="text-[#BA4680] mb-6">
                  {activeModal.product.isPromo && activeModal.product.promoPrice ? (
                    <div className="flex flex-col">
                      <span className="text-xs line-through text-[#BA4680]/60">
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

                {/* Descrição - abaixo do preço */}
                {activeModal.product.description && (
                  <p className="text-sm text-[#BA4680]/80 mb-6 leading-relaxed">{activeModal.product.description}</p>
                )}

                {/* Espaçador que empurra conteúdo para baixo */}
                <div className="flex-1" />

                {/* Observação - no final */}
                {activeModal.product.observation && (
                  <p className="text-xs text-[#BA4680]/70 mb-4">{activeModal.product.observation}</p>
                )}

                {/* Menu vertical de fotos/vídeos - no final acima do botão */}
                {modalImages.length > 1 && (
                  <div className="flex flex-col gap-2 mb-4">
                    {modalImages.map((image, index) => {
                      const isThumbVideo = isVideoUrl(image);
                      return (
                        <button
                          key={`${activeModal.product.id}-modal-thumb-${index}`}
                          type="button"
                          onClick={() => setActiveModal({ product: activeModal.product, image, initialImage: activeModal.initialImage })}
                          className={`relative h-16 w-full rounded-lg overflow-hidden border-2 transition ${
                            image === activeModal.image
                              ? 'border-[#D05B92] ring-2 ring-[#D05B92]/40'
                              : 'border-gray-200 hover:border-[#D05B92]/60'
                          }`}
                          aria-label={`${isThumbVideo ? 'Vídeo' : 'Foto'} ${index + 1}`}
                        >
                          {isThumbVideo ? (
                            <>
                              <video src={image} className="h-full w-full object-cover" preload="metadata" muted />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Play size={18} fill="white" className="text-white" />
                              </div>
                            </>
                          ) : (
                            <img src={image} alt="" className="h-full w-full object-cover" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Botão de pedido - no final */}
                <a
                  href={getWhatsAppUrl(activeModal.product)}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-2 bg-[#D05B92] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:brightness-110 transition w-full"
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
