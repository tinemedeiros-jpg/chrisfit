
import React, { useState, useEffect } from 'react';
import { Product, ViewMode } from './types';
import Header from './components/Header';
import Catalog from './components/Catalog';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import { ShoppingBag, Settings } from 'lucide-react';

const STORAGE_KEY = 'chrisfit_products_v1';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('catalog');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProducts(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading products", e);
      }
    } else {
      const mockData: Product[] = [
        {
          id: '1',
          code: '01',
          name: 'Conjunto Importado Meia coxa',
          price: 70,
          sizes: ['P/M', 'G/GG'],
          imageUrl: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=800',
          observation: 'á confirmar disponibilidade de cores e tamanhos.',
          createdAt: Date.now()
        },
        {
          id: '2',
          code: '02',
          name: 'Legging Texturizada',
          price: 85,
          sizes: ['M', 'G'],
          imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=800',
          observation: 'Várias cores disponíveis.',
          createdAt: Date.now() - 1000
        }
      ];
      setProducts(mockData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
    }
  }, []);

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
  };

  const addProduct = (product: Product) => {
    saveProducts([product, ...products]);
  };

  const updateProduct = (updatedProduct: Product) => {
    saveProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (id: string) => {
    if (confirm('Deseja realmente excluir este item?')) {
      saveProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {viewMode === 'catalog' ? (
          <Catalog products={products} />
        ) : (
          <AdminPanel 
            products={products} 
            onAdd={addProduct} 
            onUpdate={updateProduct}
            onDelete={deleteProduct} 
          />
        )}
      </main>

      {/* Navigation bar moved to the bottom-left */}
      <nav className="fixed bottom-8 left-4 md:left-8 bg-[#1a1a1a] shadow-2xl rounded-2xl p-2 flex items-center border border-white/10 z-50">
        <button 
          onClick={() => setViewMode('catalog')}
          className={`px-6 md:px-8 py-3 rounded-xl transition-all flex items-center space-x-2 ${
            viewMode === 'catalog' 
            ? 'bg-[#a15278] text-white shadow-lg scale-105' 
            : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShoppingBag size={20} />
          <span className="text-xs font-bold uppercase tracking-widest sport-font">Catálogo</span>
        </button>
        <div className="w-px h-6 bg-white/10 mx-2"></div>
        <button 
          onClick={() => setViewMode('admin')}
          className={`px-6 md:px-8 py-3 rounded-xl transition-all flex items-center space-x-2 ${
            viewMode === 'admin' 
            ? 'bg-[#a15278] text-white shadow-lg scale-105' 
            : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings size={20} />
          <span className="text-xs font-bold uppercase tracking-widest sport-font">Admin</span>
        </button>
      </nav>

      <Footer />
    </div>
  );
};

export default App;
