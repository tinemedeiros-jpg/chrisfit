
import React, { useEffect, useMemo, useState } from 'react';
import { Product, ProductUpsertPayload } from '../types';
import { Plus, Trash2, Camera, X, Edit2, LogIn, CheckCircle2, LogOut, Play, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { isVideoFile, validateVideoDuration, isVideoUrl } from '../lib/mediaUtils';
import PriceText from './PriceText';

interface AdminPanelProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  onAdd: (payload: ProductUpsertPayload) => Promise<void>;
  onUpdate: (payload: ProductUpsertPayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const MAX_IMAGES = 5;
const ADMIN_VERSION = 'v0.20260213_1631';

const sanitizePriceInput = (value: string) => {
  const normalized = value.replace(/\./g, ',').replace(/[^\d,]/g, '');
  const [integerPart, ...decimalParts] = normalized.split(',');
  if (decimalParts.length === 0) {
    return integerPart;
  }
  return `${integerPart},${decimalParts.join('')}`;
};

const parsePriceToNumber = (value: string) => {
  const normalized = value.replace(/\./g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const formatPriceDisplay = (value: string) => {
  if (!value) return '';
  const parsed = parsePriceToNumber(value);
  if (!Number.isFinite(parsed)) return value;
  return parsed.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const AdminPanel: React.FC<AdminPanelProps> = ({ products, isLoading, error, onAdd, onUpdate, onDelete, onRefresh }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<Array<string | null>>([]);
  const [newImages, setNewImages] = useState<Array<File | null>>(() => Array(MAX_IMAGES).fill(null));
  const [featuredImageIndex, setFeaturedImageIndex] = useState(0);
  const [sortColumn, setSortColumn] = useState<'code' | 'name' | 'price' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Função para calcular o próximo código disponível
  const getNextAvailableCode = () => {
    if (products.length === 0) return '0001';

    const codes = products
      .map(p => p.code)
      .map(code => parseInt(code, 10))
      .filter(num => !isNaN(num));

    if (codes.length === 0) return '0001';

    const maxCode = Math.max(...codes);
    const nextCode = maxCode + 1;
    return String(nextCode).padStart(4, '0');
  };

  // Handler para ordenação de colunas
  const handleSort = (column: 'code' | 'name' | 'price') => {
    if (sortColumn === column) {
      // Se já está ordenando por essa coluna, inverte a direção
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Nova coluna, começa com ascendente
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Produtos ordenados
  const sortedProducts = useMemo(() => {
    if (!sortColumn) return products;

    return [...products].sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case 'code':
          comparison = a.code.localeCompare(b.code);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          const priceA = a.isPromo && a.promoPrice ? a.promoPrice : a.price;
          const priceB = b.isPromo && b.promoPrice ? b.promoPrice : b.price;
          comparison = priceA - priceB;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [products, sortColumn, sortDirection]);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    price: '',
    promoPrice: '',
    isPromo: false,
    isFeatured: false,
    isActive: true,
    sizes: [] as string[],
    observation: '',
    description: ''
  });
  const [sizeInput, setSizeInput] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(Boolean(data.session));
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Auto-preenche código ao abrir form de novo produto
  useEffect(() => {
    if (showAddForm && !editingId && !formData.code) {
      setFormData(prev => ({
        ...prev,
        code: getNextAvailableCode()
      }));
    }
  }, [showAddForm, editingId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      setAuthError('Login inválido. Confira email e senha.');
    } else {
      await onRefresh();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const normalizeImageSlots = (images: Array<string | null>) => {
    const next = Array<string | null>(MAX_IMAGES).fill(null);
    images.forEach((image, index) => {
      if (index < MAX_IMAGES) {
        next[index] = image;
      }
    });
    return next;
  };

  const countImages = (existing: Array<string | null>, nextFiles: Array<File | null>) =>
    existing.reduce((count, url, index) => count + (nextFiles[index] ? 1 : url ? 1 : 0), 0);

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      code: product.code,
      name: product.name,
      price: product.price.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
      promoPrice: product.promoPrice
        ? product.promoPrice.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
        : '',
      isPromo: Boolean(product.isPromo),
      isFeatured: Boolean(product.isFeatured),
      isActive: product.isActive !== false,
      sizes: product.sizes,
      observation: product.observation || '',
      description: product.description || ''
    });
    setExistingImages(normalizeImageSlots(product.images));
    setNewImages(Array(MAX_IMAGES).fill(null));
    setFeaturedImageIndex(
      getFirstAvailableImageIndex(normalizeImageSlots(product.images), Array(MAX_IMAGES).fill(null))
    );
    setShowAddForm(true);
    setSizeInput('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      code: '',
      name: '',
      price: '',
      promoPrice: '',
      isPromo: false,
      isFeatured: false,
      isActive: true,
      sizes: [],
      observation: ''
    });
    setExistingImages([]);
    setNewImages(Array(MAX_IMAGES).fill(null));
    setFeaturedImageIndex(0);
    setShowAddForm(false);
    setIsSubmitting(false);
    setSizeInput('');
  };

  const remainingSlots = useMemo(() => {
    const totalSelected = countImages(normalizeImageSlots(existingImages), newImages);
    return MAX_IMAGES - totalSelected;
  }, [existingImages, newImages]);

  const sizeOptions = useMemo(() => {
    const uniqueSizes = new Set<string>();
    products.forEach((product) => {
      product.sizes.forEach((size) => {
        if (size.trim()) {
          uniqueSizes.add(size.trim());
        }
      });
    });
    return Array.from(uniqueSizes).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [products]);

  const addSize = (rawSize: string) => {
    const trimmed = rawSize.trim();
    if (!trimmed) return;
    setFormData((prev) => {
      const exists = prev.sizes.some((size) => size.toLowerCase() === trimmed.toLowerCase());
      if (exists) return prev;
      return { ...prev, sizes: [...prev.sizes, trimmed] };
    });
    setSizeInput('');
  };

  const removeSize = (sizeToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((size) => size !== sizeToRemove)
    }));
  };

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizePriceInput(event.target.value);
    setFormData((prev) => ({ ...prev, price: sanitized }));
  };

  const handlePriceBlur = () => {
    setFormData((prev) => ({ ...prev, price: formatPriceDisplay(prev.price) }));
  };

  const handlePromoPriceBlur = () => {
    setFormData((prev) => ({ ...prev, promoPrice: formatPriceDisplay(prev.promoPrice) }));
  };

  const getFirstAvailableImageIndex = (images: Array<string | null>, nextFiles: Array<File | null>) => {
    const next = images.findIndex((image, index) => Boolean(image || nextFiles[index]));
    return next === -1 ? 0 : next;
  };

  const reorderImagesForFeatured = (
    images: Array<string | null>,
    nextFiles: Array<File | null>,
    highlightIndex: number
  ) => {
    if (highlightIndex <= 0 || highlightIndex >= MAX_IMAGES) {
      return { images, nextFiles };
    }
    if (!images[highlightIndex] && !nextFiles[highlightIndex]) {
      return { images, nextFiles };
    }
    const nextImages = [...images];
    const updatedFiles = [...nextFiles];
    [nextImages[0], nextImages[highlightIndex]] = [nextImages[highlightIndex], nextImages[0]];
    [updatedFiles[0], updatedFiles[highlightIndex]] = [updatedFiles[highlightIndex], updatedFiles[0]];
    return { images: nextImages, nextFiles: updatedFiles };
  };

  const handleFileChange = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    // Validar duração do vídeo (máximo 30 segundos)
    if (isVideoFile(file)) {
      const validation = await validateVideoDuration(file, 30);
      if (!validation.valid) {
        alert(`❌ ${validation.message}\n\nPor favor, edite o vídeo para ter no máximo 30 segundos e tente novamente.`);
        event.target.value = '';
        return;
      }
    }

    setNewImages((prev) => {
      const next = [...prev];
      next[index] = file;

      const totalImages = countImages(normalizeImageSlots(existingImages), next);
      if (totalImages > MAX_IMAGES) {
        alert(`Você pode enviar no máximo ${MAX_IMAGES} imagens por produto.`);
        event.target.value = '';
        return prev;
      }

      return next;
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => {
      const next = normalizeImageSlots(prev);
      next[index] = null;
      return next;
    });
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  useEffect(() => {
    const normalizedImages = normalizeImageSlots(existingImages);
    const nextIndex = getFirstAvailableImageIndex(normalizedImages, newImages);
    const hasSelected = Boolean(
      normalizedImages[featuredImageIndex] || newImages[featuredImageIndex]
    );
    if (!hasSelected && nextIndex !== featuredImageIndex) {
      setFeaturedImageIndex(nextIndex);
    }
  }, [existingImages, newImages, featuredImageIndex]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.code || formData.sizes.length === 0) {
      alert('Preencha nome, código, preço e pelo menos um tamanho.');
      return;
    }
    const parsedPrice = parsePriceToNumber(formData.price);
    if (!Number.isFinite(parsedPrice)) {
      alert('Informe um preço válido.');
      return;
    }
    const parsedPromoPrice = formData.promoPrice ? parsePriceToNumber(formData.promoPrice) : null;
    if (formData.promoPrice && !Number.isFinite(parsedPromoPrice ?? NaN)) {
      alert('Informe um preço promocional válido.');
      return;
    }
    if (formData.isPromo && (!Number.isFinite(parsedPromoPrice ?? NaN) || !formData.promoPrice)) {
      alert('Informe um preço promocional válido.');
      return;
    }
    setIsSubmitting(true);
    const normalizedImages = normalizeImageSlots(existingImages);
    const { images: reorderedImages, nextFiles: reorderedNewImages } = reorderImagesForFeatured(
      normalizedImages,
      newImages,
      featuredImageIndex
    );

    const payload: ProductUpsertPayload = {
      id: editingId || undefined,
      code: formData.code,
      name: formData.name,
      price: parsedPrice,
      promoPrice: parsedPromoPrice,
      isPromo: formData.isPromo,
      isFeatured: formData.isFeatured,
      isActive: formData.isActive,
      sizes: formData.sizes,
      observation: formData.observation,
      description: formData.description,
      existingImages: reorderedImages,
      newImages: reorderedNewImages
    };

    try {
      if (editingId) {
        await onUpdate(payload);
      } else {
        await onAdd(payload);
      }
      cancelEdit();
    } catch (submitError) {
      alert(submitError instanceof Error ? submitError.message : 'Erro ao salvar.');
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (product: Product, field: 'isFeatured' | 'isPromo') => {
    if (statusUpdatingId) return;
    // Não permite alterar status se o produto estiver desabilitado
    if (product.isActive === false) {
      return;
    }
    if (field === 'isPromo' && !product.isPromo) {
      return;
    }
    const nextIsFeatured = field === 'isFeatured' ? !product.isFeatured : product.isFeatured;
    const nextIsPromo = field === 'isPromo' ? !product.isPromo : product.isPromo;
    if (field === 'isPromo' && !product.isPromo && (!product.promoPrice || product.promoPrice <= 0)) {
      alert('Defina o preço promocional na edição antes de ativar a promoção.');
      return;
    }
    setStatusUpdatingId(product.id);
    const payload: ProductUpsertPayload = {
      id: product.id,
      code: product.code,
      name: product.name,
      price: product.price,
      promoPrice: product.promoPrice ?? null,
      isPromo: nextIsPromo,
      isFeatured: nextIsFeatured,
      isActive: product.isActive,
      sizes: product.sizes,
      observation: product.observation ?? '',
      description: product.description ?? '',
      existingImages: normalizeImageSlots(product.images),
      newImages: Array(MAX_IMAGES).fill(null)
    };
    try {
      await onUpdate(payload);
    } catch (submitError) {
      alert(submitError instanceof Error ? submitError.message : 'Erro ao atualizar status.');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleActiveToggle = async (product: Product) => {
    if (statusUpdatingId) return;
    setStatusUpdatingId(product.id);
    const payload: ProductUpsertPayload = {
      id: product.id,
      code: product.code,
      name: product.name,
      price: product.price,
      promoPrice: product.promoPrice ?? null,
      isPromo: product.isPromo,
      isFeatured: product.isFeatured,
      isActive: !product.isActive,
      sizes: product.sizes,
      observation: product.observation ?? '',
      description: product.description ?? '',
      existingImages: normalizeImageSlots(product.images),
      newImages: Array(MAX_IMAGES).fill(null)
    };

    try {
      await onUpdate(payload);
    } catch (updateError) {
      alert(updateError instanceof Error ? updateError.message : 'Erro ao atualizar.');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
        <div className="bg-[#f4fbff] p-10 shadow-2xl border border-[#D05B92]/10 w-full max-w-md text-center">
          <div className="bg-[#D05B92]/10 w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <LogIn className="text-[#D05B92]" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2 sport-font italic">Acesso Restrito</h2>
          <p className="text-gray-500 text-sm mb-8">Entre com seu usuário do Supabase para gerenciar.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" 
              placeholder="Seu email..."
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-100 py-4 px-6 outline-none focus:border-[#D05B92] transition-all text-center"
              autoFocus
            />
            <input 
              type="password" 
              placeholder="Sua senha..."
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-100 py-4 px-6 outline-none focus:border-[#D05B92] transition-all text-center"
            />
            {authError && <p className="text-xs text-red-500">{authError}</p>}
            <button 
              type="submit"
              className="w-full bg-[#D05B92] text-white py-4 rounded-2xl font-bold shadow-xl hover:brightness-110 transition-all flex items-center justify-center space-x-2"
            >
              <span>Entrar no Dashboard</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-black text-[#D05B92] sport-font italic">Dashboard</h2>
          <p className="text-gray-500 text-sm font-medium">Gerenciamento de Produtos</p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 mt-2">Versão {ADMIN_VERSION}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => showAddForm ? cancelEdit() : setShowAddForm(true)}
            className={`px-6 py-3 rounded-full flex items-center space-x-2 shadow-lg transition-all ${
              showAddForm ? 'bg-gray-200 text-gray-600' : 'bg-[#D05B92] text-white hover:brightness-110'
            }`}
          >
            {showAddForm ? <X size={20} /> : <Plus size={20} />}
            <span className="font-bold sport-font">{showAddForm ? 'Fechar' : 'Novo Item'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-3 rounded-full flex items-center space-x-2 bg-gray-100 text-gray-600 shadow-md hover:bg-gray-200 transition-all"
          >
            <LogOut size={18} />
            <span className="font-bold sport-font">DESLOGAR</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#f4fbff] p-8 shadow-2xl mb-12 border border-[#D05B92]/10 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#D05B92]"></div>
          <h3 className="text-xl font-bold sport-font italic text-gray-800 flex items-center space-x-2">
            {editingId ? <Edit2 size={20} /> : <Plus size={20} />}
            <span>{editingId ? 'Editar Produto' : 'Cadastrar Novo Item'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="space-y-2 md:col-span-3">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Código</label>
              <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 p-4 outline-none focus:border-[#D05B92]" placeholder="Ex: 01" />
            </div>
            <div className="md:col-span-6 space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Nome do Produto</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 p-4 outline-none focus:border-[#D05B92]" placeholder="Ex: Conjunto Fitness Premium" />
            </div>
            <div className="space-y-2 md:col-span-3">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Preço (R$)</label>
              <input
                required
                type="text"
                inputMode="decimal"
                value={formData.price}
                onChange={handlePriceChange}
                onBlur={handlePriceBlur}
                className="w-full bg-gray-50 border border-gray-100 p-4 outline-none focus:border-[#D05B92]"
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2 md:col-span-12">
              <div className="flex items-center gap-4">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Destaque & Promoção</label>
                <label className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(event) => setFormData((prev) => ({ ...prev, isFeatured: event.target.checked }))}
                    className="h-4 w-4 border-gray-300 text-[#D05B92] focus:ring-[#D05B92]"
                  />
                  Marcar como destaque
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                  <input
                    type="checkbox"
                    checked={formData.isPromo}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        isPromo: event.target.checked
                      }))
                    }
                    className="h-4 w-4 border-gray-300 text-[#D05B92] focus:ring-[#D05B92]"
                  />
                  Marcar como promoção
                </label>
              </div>
              {formData.isPromo && (
                <input
                  required
                  type="text"
                  inputMode="decimal"
                  value={formData.promoPrice}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, promoPrice: sanitizePriceInput(event.target.value) }))
                  }
                  onBlur={handlePromoPriceBlur}
                  className="w-full max-w-xs bg-gray-50 border border-gray-100 p-4 outline-none focus:border-[#D05B92]"
                  placeholder="Preço promocional"
                />
              )}
            </div>
            <div className="space-y-2 md:col-span-12">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Descrição (aparece apenas na modal)</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 p-4 outline-none focus:border-[#D05B92] min-h-[100px]"
                placeholder="Descrição detalhada do produto..."
              />
            </div>
            <div className="space-y-2 md:col-span-5">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Tamanhos (P, M, G...)</label>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    list="size-options"
                    value={sizeInput}
                    onChange={(event) => setSizeInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addSize(sizeInput);
                      }
                    }}
                    className="flex-1 bg-gray-50 border border-gray-100 p-3 outline-none focus:border-[#D05B92] text-sm"
                    placeholder="Tamanho"
                  />
                  <button
                    type="button"
                    onClick={() => addSize(sizeInput)}
                    className="px-4 py-2 rounded-lg bg-[#D05B92] text-white text-xs font-bold hover:brightness-110 transition-all whitespace-nowrap"
                  >
                    Adicionar
                  </button>
                </div>
                <datalist id="size-options">
                  {sizeOptions.map((size) => (
                    <option key={size} value={size} />
                  ))}
                </datalist>
                {formData.sizes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.sizes.map((size) => (
                      <span
                        key={size}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-xs font-semibold text-gray-600"
                      >
                        {size}
                        <button
                          type="button"
                          onClick={() => removeSize(size)}
                          className="text-gray-400 hover:text-gray-600"
                          aria-label={`Remover tamanho ${size}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400">Adicione pelo menos um tamanho.</p>
                )}
              </div>
            </div>
            <div className="space-y-2 md:col-span-7">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Imagens do Produto</label>

              {/* Linha 1: Label + 5 quadrados de upload */}
              <div className="flex items-start gap-3 mb-2">
                <div className="text-[11px] text-gray-400 uppercase tracking-wider pt-2 w-32 flex-shrink-0">
                  Adicionar Imagem
                </div>
                <div className="flex gap-2 flex-1">
                  {Array.from({ length: MAX_IMAGES }).map((_, index) => {
                    const hasImage = existingImages[index] || newImages[index];
                    return (
                      <label
                        key={`image-input-${index}`}
                        className="relative w-20 h-20 border-2 border-dashed border-gray-300 hover:border-[#D05B92] cursor-pointer flex items-center justify-center bg-gray-50 transition-colors overflow-hidden"
                      >
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={(event) => handleFileChange(index, event)}
                          className="hidden"
                        />
                        {hasImage ? (
                          <div className="relative w-full h-full">
                            {existingImages[index] ? (
                              <>
                                <img src={existingImages[index] ?? ''} alt={`${index + 1}`} className="w-full h-full object-cover" />
                                {isVideoUrl(existingImages[index]) && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                                    <Play size={16} fill="white" className="text-white" />
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    removeExistingImage(index);
                                  }}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 shadow"
                                >
                                  <X size={10} />
                                </button>
                              </>
                            ) : newImages[index] ? (
                              <>
                                <div className="w-full h-full flex items-center justify-center bg-pink-50 text-[#D05B92] text-[10px] font-bold">
                                  Novo
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    removeNewImage(index);
                                  }}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 shadow"
                                >
                                  <X size={10} />
                                </button>
                              </>
                            ) : null}
                          </div>
                        ) : (
                          <Plus size={24} className="text-gray-400" />
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Linha 2: Label + 5 radio buttons */}
              <div className="flex items-center gap-3">
                <div className="text-[11px] text-gray-400 uppercase tracking-wider w-32 flex-shrink-0">
                  Imagem pro Destaque
                </div>
                <div className="flex gap-2 flex-1">
                  {Array.from({ length: MAX_IMAGES }).map((_, index) => (
                    <div key={`radio-${index}`} className="w-20 flex justify-center">
                      <input
                        type="radio"
                        name="featured-image"
                        checked={featuredImageIndex === index}
                        onChange={() => setFeaturedImageIndex(index)}
                        className="h-4 w-4 text-[#D05B92] focus:ring-[#D05B92] cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-gray-400 mt-2">Máximo de {MAX_IMAGES} imagens. Espaços restantes: {remainingSlots}.</p>
            </div>
            <div className="space-y-2 md:col-span-12">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Observações (opcional)</label>
              <textarea value={formData.observation} onChange={e => setFormData({...formData, observation: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 p-4 outline-none focus:border-[#D05B92] min-h-[80px]" placeholder="Ex: Confirmar cores disponíveis..." />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button type="submit" disabled={isSubmitting} className="flex-grow bg-[#D05B92] text-white py-4 rounded-2xl font-bold shadow-xl hover:brightness-110 transition-all flex items-center justify-center space-x-2 disabled:opacity-60">
              <CheckCircle2 size={20} />
              <span className="sport-font">{isSubmitting ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Adicionar ao Catálogo'}</span>
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="bg-gray-100 text-gray-500 px-8 rounded-2xl font-bold hover:bg-gray-200 transition-all">
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      <div className="bg-[#f4fbff] shadow-2xl overflow-hidden border border-[#D05B92]/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#D05B92]/5 text-[#D05B92] font-bold uppercase text-[10px] tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Visual</th>
                <th
                  className="px-8 py-6 cursor-pointer hover:bg-[#D05B92]/10 transition-colors"
                  onClick={() => handleSort('code')}
                >
                  <div className="flex items-center gap-2">
                    Cód.
                    {sortColumn === 'code' && (
                      sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th
                  className="px-8 py-6 cursor-pointer hover:bg-[#D05B92]/10 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Nome
                    {sortColumn === 'name' && (
                      sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th
                  className="px-8 py-6 cursor-pointer hover:bg-[#D05B92]/10 transition-colors"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center gap-2">
                    Preço
                    {sortColumn === 'price' && (
                      sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Tamanhos</th>
                <th className="px-8 py-6">Observações</th>
                <th className="px-8 py-6">Imagens</th>
                <th className="px-8 py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="relative w-14 h-14">
                      <img
                        src={
                          product.images.find((image): image is string => Boolean(image)) ??
                          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400'
                        }
                        className="w-14 h-14 object-cover shadow-md border-2 border-white"
                      />
                      {isVideoUrl(product.images.find((image): image is string => Boolean(image)) ?? null) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play size={18} fill="white" className="text-white" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-4 font-mono text-sm font-bold text-gray-400">{product.code}</td>
                  <td className="px-8 py-4 font-bold text-gray-800 sport-font italic">{product.name}</td>
                  <td className="px-8 py-4 text-[#D05B92] font-black">
                    R$ <PriceText value={product.price} decimalsClassName="text-[0.33em]" />
                  </td>
                  <td className="px-8 py-4 text-xs text-gray-500">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {product.isActive === false && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 font-semibold">
                          Desabilitado
                        </span>
                      )}
                      {product.isFeatured && (
                        <span className="px-2 py-1 bg-[#D05B92]/10 text-[#D05B92] font-semibold">
                          Destaque
                        </span>
                      )}
                      {product.isPromo && (
                        <span className="px-2 py-1 bg-pink-100 text-[#BA4680] font-semibold">
                          Promoção
                        </span>
                      )}
                      {product.isActive !== false && !product.isFeatured && !product.isPromo && <span>—</span>}
                    </div>
                    {product.isPromo && product.promoPrice ? (
                      <p className="text-[11px] text-[#BA4680] font-semibold">
                        R$ <PriceText value={product.promoPrice} decimalsClassName="text-[0.33em]" />
                      </p>
                    ) : null}
                    <div className="flex flex-col gap-2 text-[11px] text-gray-500">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={product.isFeatured}
                          disabled={statusUpdatingId === product.id || product.isActive === false}
                          onChange={() => handleStatusToggle(product, 'isFeatured')}
                          className="h-4 w-4 border-gray-300 text-[#D05B92] focus:ring-[#D05B92] disabled:opacity-50"
                        />
                        <span className={product.isActive === false ? 'opacity-50' : ''}>Destaque</span>
                      </label>
                      {product.isPromo && (
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={product.isPromo}
                            disabled={statusUpdatingId === product.id || product.isActive === false}
                            onChange={() => handleStatusToggle(product, 'isPromo')}
                            className="h-4 w-4 border-gray-300 text-[#D05B92] focus:ring-[#D05B92] disabled:opacity-50"
                          />
                          <span className={product.isActive === false ? 'opacity-50' : ''}>Promoção</span>
                        </label>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm font-medium text-gray-500">{product.sizes.join(', ')}</td>
                  <td className="px-8 py-4 text-sm text-gray-400">
                    {product.observation ? product.observation : '—'}
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2">
                      {product.images.map((image, index) => (
                        <div
                          key={`${product.id}-slot-${index}`}
                          className="w-10 h-10 border border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50 text-[9px] text-gray-300 font-semibold relative"
                        >
                          {image ? (
                            <>
                              <img src={image} alt={`Imagem ${index + 1}`} className="w-full h-full object-cover" />
                              {isVideoUrl(image) && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <Play size={14} fill="white" className="text-white" />
                                </div>
                              )}
                            </>
                          ) : (
                            index + 1
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end items-center space-x-3">
                      <button
                        onClick={() => startEdit(product)}
                        disabled={product.isActive === false}
                        className={`p-3 rounded-xl transition-all ${
                          product.isActive === false
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-blue-400 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        title={product.isActive === false ? "Item desabilitado" : "Editar item"}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(product.id)}
                        className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Excluir item"
                      >
                        <Trash2 size={18} />
                      </button>
                      <label className="flex items-center gap-2 text-[11px] text-gray-600">
                        <input
                          type="checkbox"
                          checked={product.isActive !== false}
                          disabled={statusUpdatingId === product.id}
                          onChange={() => handleActiveToggle(product)}
                          className="h-4 w-4 border-gray-300 text-[#D05B92] focus:ring-[#D05B92]"
                        />
                        Ativo
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isLoading && (
          <div className="py-24 text-center">
            <p className="text-gray-400 font-medium">Carregando produtos...</p>
          </div>
        )}
        {!isLoading && error && (
          <div className="py-24 text-center">
            <p className="text-red-500 font-medium">Erro ao carregar produtos.</p>
            <p className="text-xs text-gray-400 mt-2">{error}</p>
          </div>
        )}
        {!isLoading && !error && products.length === 0 && (
          <div className="py-24 text-center">
            <div className="bg-gray-50 w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Plus className="text-gray-300" size={32} />
            </div>
            <p className="text-gray-400 font-medium">Nenhum produto cadastrado ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
