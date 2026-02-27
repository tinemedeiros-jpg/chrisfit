
import React, { useCallback, useEffect, useState } from 'react';
import { Product, ProductUpsertPayload, ViewMode } from './types';
import Header from './components/Header';
import Catalog from './components/Catalog';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import { isSupabaseConfigured, supabase } from './lib/supabaseClient';

const BUCKET_NAME = 'product-images';
const MAX_IMAGES = 5;

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    window.location.hash.startsWith('#/admin') ? 'admin' : 'catalog'
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const resolveImageUrl = useCallback((url: string | null) => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(url);
    return data.publicUrl;
  }, []);

  const fetchProducts = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setProducts([]);
      setError('Configuração ausente: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('products')
      .select(
        'id, code, name, price, promo_price, is_promo, is_featured, is_active, sizes, colors, observation, description, created_at, product_images ( url, position )'
      )
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setIsLoading(false);
      return;
    }

    const mappedProducts = (data ?? []).map((product) => {
      const images = Array<string | null>(MAX_IMAGES).fill(null);
      const sortedImages = (product.product_images ?? []).sort((a, b) => a.position - b.position);
      sortedImages.forEach((image) => {
        if (image.position >= 1 && image.position <= MAX_IMAGES) {
          images[image.position - 1] = resolveImageUrl(image.url);
        }
      });

      return {
        id: product.id,
        code: product.code ?? '',
        name: product.name ?? '',
        price: typeof product.price === 'number' ? product.price : Number(product.price ?? 0),
        promoPrice:
          typeof product.promo_price === 'number'
            ? product.promo_price
            : product.promo_price
              ? Number(product.promo_price)
              : null,
        isPromo: Boolean(product.is_promo),
        isFeatured: Boolean(product.is_featured),
        isActive: product.is_active !== false,
        sizes: Array.isArray(product.sizes) ? product.sizes : [],
        colors: Array.isArray(product.colors) ? product.colors.filter((color) => typeof color === 'string') : [],
        images,
        observation: product.observation ?? null,
        description: product.description ?? null,
        createdAt: product.created_at ?? ''
      } satisfies Product;
    });

    setProducts(mappedProducts);
    setIsLoading(false);
  }, [resolveImageUrl]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const syncViewMode = () => {
      setViewMode(window.location.hash.startsWith('#/admin') ? 'admin' : 'catalog');
    };
    syncViewMode();
    window.addEventListener('hashchange', syncViewMode);
    return () => window.removeEventListener('hashchange', syncViewMode);
  }, []);

  const uploadImages = async (productId: string, files: Array<{ file: File; position: number }>) => {
    if (!isSupabaseConfigured) {
      throw new Error('Configuração do Supabase ausente.');
    }

    const uploadedEntries: Array<{ url: string; position: number }> = [];

    for (const { file, position } of files) {
      const filePath = `${productId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
        upsert: true
      });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
      uploadedEntries.push({ url: data.publicUrl, position });
    }

    return uploadedEntries;
  };

  const syncProductImages = async (
    productId: string,
    existingImages: Array<string | null>,
    newImages: Array<File | null>
  ) => {
    const imagesWithPosition = newImages
      .map((file, index) => (file ? { file, position: index + 1 } : null))
      .filter((entry): entry is { file: File; position: number } => Boolean(entry));
    const uploadedEntries = imagesWithPosition.length > 0 ? await uploadImages(productId, imagesWithPosition) : [];
    const allImages = Array<string | null>(MAX_IMAGES).fill(null);

    existingImages.forEach((url, index) => {
      if (index < MAX_IMAGES) {
        allImages[index] = url ?? null;
      }
    });

    uploadedEntries.forEach(({ url, position }) => {
      if (position >= 1 && position <= MAX_IMAGES) {
        allImages[position - 1] = url;
      }
    });

    const { error: deleteError } = await supabase
      .from('product_images')
      .delete()
      .eq('products_id', productId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    const payload = allImages
      .map((url, index) =>
        url
          ? {
              products_id: productId,
              url,
              position: index + 1
            }
          : null
      )
      .filter((entry): entry is { products_id: string; url: string; position: number } => Boolean(entry));

    if (payload.length > 0) {
      const { error: insertError } = await supabase.from('product_images').insert(payload);

      if (insertError) {
        throw new Error(insertError.message);
      }
    }
  };

  const addProduct = async (payload: ProductUpsertPayload) => {
    if (!isSupabaseConfigured) {
      throw new Error('Configuração do Supabase ausente.');
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Faça login para cadastrar itens.');
    }

    const { data, error: insertError } = await supabase
      .from('products')
      .insert({
        code: payload.code,
        name: payload.name,
        price: payload.price,
        promo_price: payload.promoPrice ?? null,
        is_promo: payload.isPromo ?? false,
        is_featured: payload.isFeatured ?? false,
        is_active: payload.isActive ?? true,
        sizes: payload.sizes,
        colors: payload.colors ?? [],
        observation: payload.observation ?? null,
        description: payload.description ?? null
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
    if (!isSupabaseConfigured) {
      throw new Error('Configuração do Supabase ausente.');
    }
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Faça login para editar itens.');
    }

    const { error: updateError } = await supabase
      .from('products')
      .update({
        code: payload.code,
        name: payload.name,
        price: payload.price,
        promo_price: payload.promoPrice ?? null,
        is_promo: payload.isPromo ?? false,
        is_featured: payload.isFeatured ?? false,
        is_active: payload.isActive ?? true,
        sizes: payload.sizes,
        colors: payload.colors ?? [],
        observation: payload.observation ?? null,
        description: payload.description ?? null
      })
      .eq('id', payload.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    await syncProductImages(payload.id, payload.existingImages, payload.newImages);
    await fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!isSupabaseConfigured) {
      setError('Configuração do Supabase ausente.');
      return;
    }

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
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <main className="flex-grow bg-[#f4fbff]">
        {viewMode === 'catalog' ? (
          <Catalog products={products} isLoading={isLoading} error={error} searchTerm={searchTerm} onSearchChange={setSearchTerm} />
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

      <Footer isAdminView={viewMode === 'admin'} />
    </div>
  );
};

export default App;
