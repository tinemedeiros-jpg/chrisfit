
import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Trash2, Camera, X, Edit2, LogIn, CheckCircle2 } from 'lucide-react';

interface AdminPanelProps {
  products: Product[];
  onAdd: (product: Product) => void;
  onUpdate: (product: Product) => void;
  onDelete: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ products, onAdd, onUpdate, onDelete }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    price: '',
    sizes: '',
    observation: '',
    imageUrl: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Senha simples para controle de acesso
    if (password === 'chris2025') {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta!');
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      code: product.code,
      name: product.name,
      price: product.price.toString(),
      sizes: product.sizes.join(', '),
      observation: product.observation || '',
      imageUrl: product.imageUrl
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ code: '', name: '', price: '', sizes: '', observation: '', imageUrl: '' });
    setShowAddForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.code) return;

    const productData: Product = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      code: formData.code,
      name: formData.name,
      price: parseFloat(formData.price),
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s !== ''),
      observation: formData.observation,
      imageUrl: formData.imageUrl || `https://picsum.photos/seed/${Math.random()}/400/600`,
      createdAt: editingId ? (products.find(p => p.id === editingId)?.createdAt || Date.now()) : Date.now()
    };

    if (editingId) {
      onUpdate(productData);
    } else {
      onAdd(productData);
    }

    cancelEdit();
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-[#a15278]/10 w-full max-w-md text-center">
          <div className="bg-[#a15278]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogIn className="text-[#a15278]" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2 sport-font italic">Acesso Restrito</h2>
          <p className="text-gray-500 text-sm mb-8">Digite a senha para gerenciar o catálogo.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Sua senha..."
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-[#a15278] transition-all text-center"
              autoFocus
            />
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
        </div>
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
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400">URL da Imagem</label>
              <div className="relative">
                <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 pl-12 outline-none focus:border-[#a15278]" placeholder="Link da imagem..." />
                <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400">Observações (opcional)</label>
            <textarea value={formData.observation} onChange={e => setFormData({...formData, observation: e.target.value})}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 outline-none focus:border-[#a15278] min-h-[100px]" placeholder="Ex: Confirmar cores disponíveis..." />
          </div>
          
          <div className="flex space-x-4">
            <button type="submit" className="flex-grow bg-[#a15278] text-white py-4 rounded-2xl font-bold shadow-xl hover:brightness-110 transition-all flex items-center justify-center space-x-2">
              <CheckCircle2 size={20} />
              <span className="sport-font">{editingId ? 'Salvar Alterações' : 'Adicionar ao Catálogo'}</span>
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
                    <img src={product.imageUrl} className="w-14 h-14 object-cover rounded-xl shadow-md border-2 border-white" />
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
        {products.length === 0 && (
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
