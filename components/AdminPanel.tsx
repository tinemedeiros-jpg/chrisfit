
import React, { useEffect, useMemo, useState } from 'react';
import { Product, ProductUpsertPayload } from '../types';
import { Plus, Trash2, Camera, X, Edit2, LogIn, CheckCircle2, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

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
const ADMIN_VERSION = '2024-09-14.1';

const AdminPanel: React.FC<AdminPanelProps> = ({ products, isLoading, error, onAdd, onUpdate, onDelete, onRefresh }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<(File | null)[]>(() => Array(MAX_IMAGES).fill(null));
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    price: '',
    sizes: '',
    observation: ''
  });

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

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      code: product.code,
      name: product.name,
      price: product.price.toString(),
      sizes: product.sizes.join(', '),
      observation: product.observation || ''
    });
    setExistingImages(product.images);
    setNewImages(Array(MAX_IMAGES).fill(null));
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ code: '', name: '', price: '', sizes: '', observation: '' });
    setExistingImages([]);
    setNewImages(Array(MAX_IMAGES).fill(null));
    setShowAddForm(false);
    setIsSubmitting(false);
  };

  const remainingSlots = useMemo(() => {
    const selectedCount = newImages.filter(Boolean).length;
    return MAX_IMAGES - existingImages.length - selectedCount;
  }, [existingImages.length, newImages]);

  const handleFileChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    setNewImages((prev) => {
      const next = [...prev];
      next[index] = file;

      const selectedCount = next.filter(Boolean).length;
      const totalImages = existingImages.length + selectedCount;
      if (totalImages > MAX_IMAGES) {
        alert(`Você pode enviar no máximo ${MAX_IMAGES} imagens por produto.`);
        event.target.value = '';
        return prev;
      }

      return next;
    });
  };

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((image) => image !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.code) return;
    setIsSubmitting(true);

    const payload: ProductUpsertPayload = {
      id: editingId || undefined,
      code: formData.code,
      name: formData.name,
      price: parseFloat(formData.price),
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s !== ''),
      observation: formData.observation,
      existingImages,
      newImages: newImages.filter((file): file is File => Boolean(file))
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

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-[#a15278]/10 w-full max-w-md text-center">
          <div className="bg-[#a15278]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogIn className="text-[#a15278]" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2 sport-font italic">Acesso Restrito</h2>
          <p className="text-gray-500 text-sm mb-8">Entre com seu usuário do Supabase para gerenciar.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" 
              placeholder="Seu email..."
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-[#a15278] transition-all text-center"
              autoFocus
            />
            <input 
              type="password" 
              placeholder="Sua senha..."
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-[#a15278] transition-all text-center"
            />
            {authError && <p className="text-xs text-red-500">{authError}</p>}
            <button 
              type="submit"
              className="w-full bg-[#a15278] text-white py-4 rounded-2xl font-bold shadow-xl hover:brightness-110 transition-all flex items-center justify-center space-x-2"
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
          <h2 className="text-4xl font-black text-[#a15278] sport-font italic">Dashboard</h2>
          <p className="text-gray-500 text-sm font-medium">Gerenciamento de Produtos</p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 mt-2">Versão {ADMIN_VERSION}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleLogout}
            className="px-4 py-3 rounded-full flex items-center space-x-2 bg-gray-100 text-gray-600 shadow-md hover:bg-gray-200 transition-all"
          >
            <LogOut size={18} />
            <span className="font-bold sport-font">Sair</span>
          </button>
          <button 
            onClick={() => showAddForm ? cancelEdit() : setShowAddForm(true)}
            className={`px-6 py-3 rounded-full flex items-center space-x-2 shadow-lg transition-all ${
              showAddForm ? 'bg-gray-200 text-gray-600' : 'bg-[#a15278] text-white hover:bg-[#8e4669]'
            }`}
          >
            {showAddForm ? <X size={20} /> : <Plus size={20} />}
            <span className="font-bold sport-font">{showAddForm ? 'Fechar' : 'Novo Item'}</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-2xl mb-12 border border-[#a15278]/10 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#a15278]"></div>
          <h3 className="text-xl font-bold sport-font italic text-gray-800 mb-4 flex items-center space-x-2">
            {editingId ? <Edit2 size={20} /> : <Plus size={20} />}
            <span>{editingId ? 'Editar Produto' : 'Cadastrar Novo Item'}</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Código</label>
              <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 outline-none focus:border-[#a15278]" placeholder="Ex: 01" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Nome do Produto</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 outline-none focus:border-[#a15278]" placeholder="Ex: Conjunto Fitness Premium" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Preço (R$)</label>
              <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 outline-none focus:border-[#a15278]" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Tamanhos (P, M, G...)</label>
              <input required type="text" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 outline-none focus:border-[#a15278]" placeholder="Ex: P, M, G" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Imagens do Produto</label>
              <div className="grid grid-cols-1 gap-3">
                {Array.from({ length: MAX_IMAGES }).map((_, index) => (
                  <label key={`image-input-${index}`} className="block text-[11px] text-gray-400">
                    Imagem {index + 1}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleFileChange(index, event)}
                      className="mt-1 w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:border-[#a15278]"
                    />
                  </label>
                ))}
              </div>
              <p className="text-[11px] text-gray-400">Máximo de {MAX_IMAGES} imagens. Espaços restantes: {remainingSlots}.</p>
              {existingImages.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {existingImages.map((url) => (
                    <div key={url} className="relative">
                      <img src={url} alt="Imagem do produto" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(url)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Observações (opcional)</label>
            <textarea value={formData.observation} onChange={e => setFormData({...formData, observation: e.target.value})}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 outline-none focus:border-[#a15278] min-h-[100px]" placeholder="Ex: Confirmar cores disponíveis..." />
          </div>
          
          <div className="flex space-x-4">
            <button type="submit" disabled={isSubmitting} className="flex-grow bg-[#a15278] text-white py-4 rounded-2xl font-bold shadow-xl hover:brightness-110 transition-all flex items-center justify-center space-x-2 disabled:opacity-60">
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

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#a15278]/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#a15278]/5 text-[#a15278] font-bold uppercase text-[10px] tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Visual</th>
                <th className="px-8 py-6">Cód.</th>
                <th className="px-8 py-6">Nome</th>
                <th className="px-8 py-6">Preço</th>
                <th className="px-8 py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-4">
                    <img src={product.images[0] ?? 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400'} className="w-14 h-14 object-cover rounded-xl shadow-md border-2 border-white" />
                  </td>
                  <td className="px-8 py-4 font-mono text-sm font-bold text-gray-400">{product.code}</td>
                  <td className="px-8 py-4 font-bold text-gray-800 sport-font italic">{product.name}</td>
                  <td className="px-8 py-4 text-[#a15278] font-black">R$ {product.price.toFixed(2)}</td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => startEdit(product)}
                        className="p-3 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Editar item"
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
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
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
