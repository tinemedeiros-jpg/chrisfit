
import React from 'react';
import { Product } from '../types';
import { MessageCircle, Play } from 'lucide-react';
import { isVideoUrl, getVideoMimeType } from '../lib/mediaUtils';

interface ProductCardProps {
  product: Product;
  onPreview: (product: Product, image: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPreview }) => {
  const whatsappNumber = "5511963554043";
  const message = encodeURIComponent(`Olá Chris! Vi no catálogo e tenho interesse no item: ${product.code} - ${product.name}`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
  const availableImages = product.images.filter(
    (image): image is string => Boolean(image)
  );
  const coverImage =
    availableImages[0] ??
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800';
  const images = availableImages.length ? availableImages : [coverImage];
  const [hoverIndex, setHoverIndex] = React.useState(0);
  const [isHovering, setIsHovering] = React.useState(false);
  const thumbsRef = React.useRef<HTMLDivElement | null>(null);
  const videoRefs = React.useRef<(HTMLVideoElement | null)[]>([]);
  const hasPromo = product.isPromo && product.promoPrice && product.promoPrice > 0;
  const displayPrice = hasPromo ? product.promoPrice ?? product.price : product.price;
  const hideButtonText = images.length >= 4;
  const handlePreview = React.useCallback(() => {
    onPreview(product, images[hoverIndex]);
  }, [hoverIndex, images, onPreview, product]);

  React.useEffect(() => {
    if (images.length <= 1 || isHovering) {
      return;
    }

    const interval = window.setInterval(() => {
      setHoverIndex((current) => (current + 1) % images.length);
    }, 8000);

    return () => window.clearInterval(interval);
  }, [images.length, isHovering]);

  // Controla play/pause dos vídeos quando o índice ativo muda
  React.useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === hoverIndex) {
          video.play().catch(() => {
            // Ignora erros de autoplay
          });
        } else {
          video.pause();
        }
      }
    });
  }, [hoverIndex]);

  const handleMouseMove = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (images.length <= 1) {
        return;
      }

      if (thumbsRef.current?.contains(event.target as Node)) {
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const relativeX = Math.min(
        rect.width,
        Math.max(0, event.clientX - rect.left)
      );
      const nextIndex = Math.min(
        images.length - 1,
        Math.floor((relativeX / rect.width) * images.length)
      );

      if (nextIndex !== hoverIndex) {
        setHoverIndex(nextIndex);
      }
    },
    [hoverIndex, images.length]
  );

  const handleMouseLeave = React.useCallback(() => {
    setIsHovering(false);
  }, []);

  const currentImage = images[hoverIndex];
  const isCurrentVideo = isVideoUrl(currentImage);

  return (
    <div className="group animate-in zoom-in duration-300">
      <div
        className="relative overflow-hidden cursor-zoom-in rounded-tr-[2rem] shadow-[0_24px_55px_-18px_rgba(0,0,0,0.7)] hover:shadow-[0_34px_70px_-22px_rgba(0,0,0,0.8)] transition-shadow duration-300"
        onClick={handlePreview}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handlePreview();
          }
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setIsHovering(true)}
      >
        {/* Background embaçado e escurecido */}
        <div className="absolute inset-0 z-0">
          {images.map((image, index) => {
            const isVideo = isVideoUrl(image);
            return isVideo ? (
              <video
                key={`${product.id}-bg-${image}-${index}`}
                src={image}
                className={`absolute inset-0 w-full h-full object-cover blur-sm brightness-75 transition-opacity duration-700 ${
                  hoverIndex === index ? 'opacity-100' : 'opacity-0'
                }`}
                muted
                loop
                playsInline
                preload="metadata"
              />
            ) : (
              <div
                key={`${product.id}-bg-${image}-${index}`}
                className={`absolute inset-0 w-full h-full bg-cover bg-center blur-sm brightness-75 transition-opacity duration-700 ${
                  hoverIndex === index ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ backgroundImage: `url(${image})` }}
              />
            );
          })}
          {/* Overlay adicional para escurecer */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Gradiente escurecendo para baixo */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.1))'
            }}
          />
        </div>

        {/* Código como aba externa */}
        <div className="absolute -left-3 top-6 z-30">
          <div className="bg-[#D05B92] px-4 py-2 shadow-lg">
            <span className="text-white text-[11px] uppercase tracking-[0.4em] font-semibold pl-2">
              {product.code}
            </span>
          </div>
        </div>

        {/* Conteúdo do card */}
        <div className="relative z-10 flex flex-col h-full min-h-[600px]">
          {/* Imagem/Vídeo nítido em carrossel - ocupa todo espaço */}
          <div className="flex-1 relative">
            {images.map((image, index) => {
              const isVideo = isVideoUrl(image);
              return isVideo ? (
                <video
                  key={`${product.id}-${image}-${index}`}
                  ref={(el) => {
                    videoRefs.current[index] = el;
                  }}
                  src={image}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                    hoverIndex === index ? 'opacity-100' : 'opacity-0'
                  }`}
                  muted
                  loop
                  playsInline
                  autoPlay={index === hoverIndex}
                  preload="metadata"
                />
              ) : (
                <img
                  key={`${product.id}-${image}-${index}`}
                  src={image}
                  alt={`${product.name} - ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                    hoverIndex === index ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="lazy"
                />
              );
            })}
          </div>

          {/* Informações do produto - alinhado à direita */}
          <div className="text-right text-white pr-6 pb-6 pt-12">
            {/* Preço */}
            <div className="mb-3">
              {hasPromo && (
                <span className="block text-sm line-through text-white/60">
                  R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              )}
              <div className="text-3xl font-bold">
                R$ {displayPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Nome */}
            <h3 className="text-2xl font-semibold leading-tight mb-2">
              {product.name}
            </h3>

            {/* Tamanhos */}
            {product.sizes.length > 0 && (
              <div className="text-[11px] uppercase tracking-[0.3em] text-white/80 mb-4">
                {product.sizes.join(' • ')}
              </div>
            )}

            {/* Observação */}
            {product.observation && (
              <p className="text-xs text-white/70 leading-relaxed mb-4">
                {product.observation}
              </p>
            )}

            {/* Thumbnails e botão */}
            <div className="flex items-center justify-end gap-3 mt-4">
              {images.length > 1 && (
                <div ref={thumbsRef} className="flex items-center gap-2">
                  {images.map((image, index) => {
                    const isThumbVideo = isVideoUrl(image);
                    return (
                      <button
                        key={`${product.id}-thumb-${index}`}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setHoverIndex(index);
                        }}
                        className={`h-10 w-10 border-2 transition-all relative ${
                          hoverIndex === index
                            ? 'border-white ring-2 ring-white/60'
                            : 'border-white/40 hover:border-white/70'
                        }`}
                        aria-label={`Mostrar ${isThumbVideo ? 'vídeo' : 'imagem'} ${index + 1}`}
                      >
                        <span
                          className="block h-full w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${image})` }}
                        />
                        {isThumbVideo && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play size={14} fill="white" className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <a
                href={whatsappUrl}
                target="_blank"
                className="bg-[#D05B92] text-white px-5 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-xl transition-all hover:brightness-110 hover:-translate-y-0.5"
                onClick={(event) => event.stopPropagation()}
                aria-label="Quero este"
              >
                <MessageCircle size={18} fill="white" />
                {!hideButtonText && <span className="sport-font text-sm">Quero este</span>}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
