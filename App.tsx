
import React, { useCallback, useEffect, useState } from 'react';
import { Product, ProductUpsertPayload, ViewMode } from './types';
import Header from './components/Header';
import Catalog from './components/Catalog';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import { ShoppingBag, Settings } from 'lucide-react';
import { supabase } from './lib/supabaseClient';

const BUCKET_NAME = 'product-images';
const MAX_IMAGES = 5;

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('catalog');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('products')
      .select('id, code, name, price, sizes, observation, created_at, product_images ( url, position )')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setIsLoading(false);
      return;
    }

    const mappedProducts = (data ?? []).map((product) => {
      const images = (product.product_images ?? [])
        .sort((a, b) => a.position - b.position)
        .map((image) => image.url);

      return {
        id: product.id,
        code: product.code ?? '',
        name: product.name ?? '',
        price: typeof product.price === 'number' ? product.price : Number(product.price ?? 0),
        sizes: Array.isArray(product.sizes) ? product.sizes : [],
        images,
        observation: product.observation ?? null,
        createdAt: product.created_at ?? ''
      } satisfies Product;
    });

    setProducts(mappedProducts);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const uploadImages = async (productId: string, files: File[]) => {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const filePath = `${productId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
        upsert: true
      });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  };

  const syncProductImages = async (productId: string, existingImages: string[], newImages: File[]) => {
    const uploadedUrls = newImages.length > 0 ? await uploadImages(productId, newImages) : [];
    const allImages = [...existingImages, ...uploadedUrls].slice(0, MAX_IMAGES);

    const { error: deleteError } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', productId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    if (allImages.length > 0) {
      const payload = allImages.map((url, index) => ({
        product_id: productId,
        url,
        position: index + 1,
        ...(userId ? { user_id: userId } : {})
      }));

      const { error: insertError } = await supabase.from('product_images').insert(payload);

      if (insertError) {
        throw new Error(insertError.message);
      }
    }
  };

  const addProduct = async (payload: ProductUpsertPayload) => {
    if (!userId) {
      throw new Error('Faça login para cadastrar itens.');
    }

    const { data, error: insertError } = await supabase
      .from('products')
      .insert({
        code: payload.code,
        name: payload.name,
        price: payload.price,
        sizes: payload.sizes,
        observation: payload.observation ?? null,
        user_id: userId
      })
      .select('id')
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    await syncProductImages(data.id, payload.existingImages, payload.newImages);
    await fetchProducts();
  };

  const updateProduct = async (payload: ProductUpsertPayload) => {
    if (!payload.id) return;
    if (!userId) {
      throw new Error('Faça login para editar itens.');
    }

    const { error: updateError } = await supabase
      .from('products')
      .update({
        code: payload.code,
        name: payload.name,
        price: payload.price,
        sizes: payload.sizes,
        observation: payload.observation ?? null
      })
      .eq('id', payload.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    await syncProductImages(payload.id, payload.existingImages, payload.newImages);
    await fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (confirm('Deseja realmente excluir este item?')) {
      const { error: deleteError } = await supabase.from('products').delete().eq('id', id);
      if (deleteError) {
        setError(deleteError.message);
        return;
      }
      await fetchProducts();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {viewMode === 'catalog' ? (
          <Catalog products={products} isLoading={isLoading} error={error} />
        ) : (
          <AdminPanel 
            products={products} 
            isLoading={isLoading}
            error={error}
            onAdd={addProduct} 
            onUpdate={updateProduct}
            onDelete={deleteProduct} 
            onRefresh={fetchProducts}
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
