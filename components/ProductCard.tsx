
import React from 'react';
import { Product } from '../types';
import { MessageCircle } from 'lucide-react';

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

  return (
    <div className="group animate-in zoom-in duration-300">
      <div
        className="overflow-hidden shadow-xl bg-white border border-[#e5f3fb] cursor-zoom-in"
        onClick={handlePreview}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handlePreview();
          }
        }}
      >
        <div className="bg-gradient-to-br from-[#FFD6E8] via-[#FFE0EF] to-[#FFC1E0] p-5 text-white relative">
          <span className="inline-flex items-center border border-white/50 bg-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.4em] font-semibold">
            {product.code}
          </span>
          <div className="absolute right-5 top-5 text-right">
            {hasPromo && (
              <span className="block text-[10px] line-through text-white/70">
                R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            )}
            <span className="text-2xl font-bold">
              R$ {displayPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <h3 className="mt-6 text-2xl font-semibold leading-tight">{product.name}</h3>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.3em] text-white/80">
            {product.sizes.length ? (
              <span>{product.sizes.join(' • ')}</span>
            ) : (
              <span>Consultar tamanhos</span>
            )}
          </div>
        </div>

        <div className="p-4">
          <div
            className="aspect-[4/5] overflow-hidden bg-[#f3f9fd] relative"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={() => setIsHovering(true)}
            onClick={handlePreview}
          >
            {images.map((image, index) => (
              <img
                key={`${product.id}-${image}-${index}`}
                src={image}
                alt={`${product.name} - ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
                  hoverIndex === index ? 'opacity-100' : 'opacity-0'
                }`}
                loading="lazy"
              />
            ))}
          </div>

          <div
            className={`mt-4 flex items-center gap-3 ${
              images.length > 1 ? 'justify-between' : 'justify-end'
            }`}
          >
            {images.length > 1 ? (
              <div ref={thumbsRef} className="flex items-center gap-2">
                {images.map((image, index) => (
                  <button
                    key={`${product.id}-thumb-${index}`}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setHoverIndex(index);
                    }}
                    className={`h-10 w-10 border transition-all ${
                      hoverIndex === index
                        ? 'border-[#FFD6E8] ring-2 ring-[#FFD6E8]/40'
                        : 'border-[#e5f3fb]'
                    }`}
                    aria-label={`Mostrar imagem ${index + 1}`}
                  >
                    <span
                      className="block h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${image})` }}
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div />
            )}
            <a
              href={whatsappUrl}
              target="_blank"
              className="bg-[#22c55e] text-white px-5 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-xl transition-transform hover:-translate-y-0.5"
              onClick={(event) => event.stopPropagation()}
              aria-label="Quero este"
            >
              <MessageCircle size={18} fill="white" />
              {!hideButtonText && <span className="sport-font text-sm">Quero este</span>}
            </a>
          </div>

          {product.observation && (
            <p className="mt-4 text-xs text-[#4b6075] leading-relaxed">
              {product.observation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
