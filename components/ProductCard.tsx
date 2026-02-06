
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
        className="rounded-3xl overflow-hidden shadow-xl bg-white border border-[#e5f3fb] cursor-zoom-in"
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
        <div className="bg-gradient-to-br from-[#2aa7df] via-[#35b0e4] to-[#1d8ec8] p-5 text-white relative">
          <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-[11px] uppercase tracking-[0.3em] font-semibold">
            {product.code}
          </span>
          <div className="absolute right-5 top-5 text-right">
            {hasPromo && (
              <span className="block text-[10px] line-through text-white/70">
                R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            )}
            <span className="text-xl font-bold">
              R$ {displayPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <h3 className="mt-6 text-2xl font-semibold leading-tight">{product.name}</h3>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.3em] text-white/80">
            {product.sizes.length ? (
              product.sizes.map((size) => (
                <span key={`${product.id}-size-${size}`} className="rounded-full border border-white/40 px-2.5 py-1">
                  {size}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-white/40 px-2.5 py-1">Consultar tamanhos</span>
            )}
          </div>
        </div>

        <div className="p-4">
          <div
            className="aspect-[4/5] overflow-hidden bg-[#f3f9fd] rounded-2xl relative"
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
            <div className="absolute inset-0 bg-[#0f1c2e]/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <a
                href={whatsappUrl}
                target="_blank"
                className="bg-[#22c55e] text-white px-6 py-3 rounded-full font-bold flex items-center space-x-2 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                onClick={(event) => event.stopPropagation()}
              >
                <MessageCircle size={20} fill="white" />
                <span className="sport-font text-sm">Quero este</span>
              </a>
            </div>
          </div>

          {images.length > 1 && (
            <div ref={thumbsRef} className="mt-4 flex items-center gap-2">
              {images.map((image, index) => (
                <button
                  key={`${product.id}-thumb-${index}`}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setHoverIndex(index);
                  }}
                  className={`h-10 w-10 rounded-xl border transition-all ${
                    hoverIndex === index
                      ? 'border-[#2aa7df] ring-2 ring-[#2aa7df]/40'
                      : 'border-[#e5f3fb]'
                  }`}
                  aria-label={`Mostrar imagem ${index + 1}`}
                >
                  <span
                    className="block h-full w-full rounded-[10px] bg-cover bg-center"
                    style={{ backgroundImage: `url(${image})` }}
                  />
                </button>
              ))}
            </div>
          )}

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
