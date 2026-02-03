
import React from 'react';
import { Product } from '../types';
import { MessageCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const whatsappNumber = "5511963554043";
  const message = encodeURIComponent(`Olá Chris! Vi no catálogo e tenho interesse no item: ${product.code} - ${product.name}`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
  const coverImage =
    product.images.find((image): image is string => Boolean(image)) ??
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800';

  return (
    <div className="group animate-in zoom-in duration-300">
      <div className="bg-transparent overflow-hidden rounded-sm transition-all duration-300 group-hover:translate-y-[-8px]">
        {/* Code Badge */}
        <div className="bg-[#a15278] text-white w-16 py-1 text-center text-sm font-black sport-font mb-1 shadow-md">
          {product.code}
        </div>
        
        {/* Image and Details Card */}
        <div className="bg-white p-1 pb-1 shadow-xl relative">
          {/* Image Container */}
          <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
            <img 
              src={coverImage} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            {/* Hover Overlay Button */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               <a 
                href={whatsappUrl}
                target="_blank"
                className="bg-[#22c55e] text-white px-6 py-3 rounded-full font-bold flex items-center space-x-2 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
              >
                <MessageCircle size={20} fill="white" />
                <span className="sport-font text-sm">Quero este</span>
              </a>
            </div>
          </div>
          
          {/* Details Bar */}
          <div className="bg-white py-5 px-3">
            <h3 className="text-[#1a1a1a] font-bold text-lg leading-tight mb-2 sport-font italic">
              {product.name}
            </h3>
            
            <div className="flex justify-between items-end mb-3">
              <span className="text-[#a15278] font-black text-2xl sport-font">
                R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <div className="flex flex-col items-end">
                <span className="text-gray-400 text-[9px] uppercase tracking-widest font-bold">Tamanhos</span>
                <span className="text-gray-800 text-sm font-black sport-font">
                  {product.sizes.join(' • ')}
                </span>
              </div>
            </div>

            {/* Observation inside the white box */}
            {product.observation && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-gray-500 text-[11px] italic leading-tight opacity-70">
                  {product.observation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
