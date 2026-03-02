'use client';

import Header from '@/components/Header';
import AIListModal from '@/components/AIListModal';
import {
  ShoppingCart, Plus, Trash2, Check, BarChart3,
  ChevronDown, ChevronUp, MapPin, Sparkles, Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  getShoppingLists,
  createShoppingList,
  addShoppingListItem,
  removeShoppingListItem,
  toggleShoppingListItem,
  ShoppingList,
} from '@/lib/api';

export default function ListasPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [showOptimization, setShowOptimization] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/entrar');
    }
  }, [user, authLoading, router]);

  const fetchLists = async () => {
    try {
      const data = await getShoppingLists();
      setLists(data);
      if (data.length > 0 && !activeListId) {
        setActiveListId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLists();
    }
  }, [user]);

  // wait for auth & fetch
  if (authLoading || (!user && !authLoading) || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin mb-4" />
        <p className="text-gray-500">Carregando suas listas...</p>
      </div>
    );
  }

  const handleAIConfirm = async (result: { name: string; items: { name: string; quantity: number; estimated_price: number | null }[] }) => {
    setShowAIModal(false);
    setIsLoading(true);
    try {
      const newList = await createShoppingList({ name: result.name });

      // Adiciona itens sequencialmente para garantir completude
      for (const item of result.items) {
        await addShoppingListItem(newList.id, {
          custom_name: item.name,
          quantity: item.quantity,
        });
      }

      await fetchLists();
      setActiveListId(newList.id);
    } catch (err) {
      alert('Erro ao criar lista com IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeList = lists.find((l) => l.id === activeListId) || lists[0];

  const toggleItem = async (itemId: string) => {
    if (!activeList) return;
    setLists(prev => prev.map(list =>
      list.id === activeList.id
        ? { ...list, items: list.items.map(i => i.id === itemId ? { ...i, is_checked: !i.is_checked } : i) }
        : list
    ));
    try {
      await toggleShoppingListItem(activeList.id, itemId);
    } catch (err) {
      console.error(err);
      fetchLists(); // revert optimistic update on failure
    }
  };

  const removeItem = async (itemId: string) => {
    if (!activeList) return;
    setLists(prev => prev.map(list =>
      list.id === activeList.id
        ? { ...list, items: list.items.filter(i => i.id !== itemId) }
        : list
    ));
    try {
      await removeShoppingListItem(activeList.id, itemId);
    } catch (err) {
      console.error(err);
      fetchLists(); // revert on failure
    }
  };

  const addItem = async () => {
    if (!newItemName.trim() || !activeList) return;
    setIsLoading(true);
    try {
      await addShoppingListItem(activeList.id, {
        custom_name: newItemName.trim(),
        quantity: 1,
      });
      setNewItemName('');
      await fetchLists();
    } catch (err) {
      console.error(err);
      alert('Erro ao adicionar item.');
    } finally {
      setIsLoading(false);
    }
  };

  const addNewList = async () => {
    const listName = prompt('Qual o nome da nova lista?');
    if (!listName) return;
    setIsLoading(true);
    try {
      const newList = await createShoppingList({ name: listName });
      await fetchLists();
      setActiveListId(newList.id);
    } catch (err) {
      console.error(err);
      alert('Erro ao criar lista.');
    } finally {
      setIsLoading(false);
    }
  };

  // Safe checks since activeList might be null if there are absolutely no lists
  const uncheckedItems = activeList?.items.filter((i) => !i.is_checked) || [];
  const checkedItems = activeList?.items.filter((i) => i.is_checked) || [];
  const estimatedTotal = uncheckedItems.reduce(
    (acc, item) => acc + (item.estimated_price || 0) * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">🛒 Minhas Listas</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAIModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-200"
            >
              <Sparkles className="h-4 w-4" />
              Criar com IA
            </button>
            <button
              onClick={addNewList}
              className="flex items-center gap-1 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nova lista
            </button>
          </div>
        </div>

        {/* List selector tabs */}
        {lists.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {lists.map((list) => (
              <button
                key={list.id}
                onClick={() => setActiveListId(list.id)}
                className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${list.id === activeListId
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {list.name} ({list.items.length})
              </button>
            ))}
          </div>
        )}

        {/* Active List Area */}
        {activeList ? (
          <>
            {/* Add item input */}
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                placeholder="Adicionar item à lista..."
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <button
                onClick={addItem}
                disabled={!newItemName.trim() || isLoading}
                className="flex items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-white hover:bg-brand-700 disabled:opacity-40 transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {/* Estimated total */}
            {estimatedTotal > 0 && (
              <div className="mb-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-brand-100">Total estimado (menor preço)</p>
                    <p className="text-2xl font-extrabold">{formatPrice(estimatedTotal)}</p>
                  </div>
                  <button
                    onClick={() => setShowOptimization(!showOptimization)}
                    className="flex items-center gap-1 rounded-xl bg-white/20 px-3 py-2 text-xs font-semibold hover:bg-white/30 transition-colors"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Otimizar
                    {showOptimization ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Optimization panel */}
            {showOptimization && (
              <div className="mb-4 rounded-2xl border border-brand-200 bg-brand-50 p-4 inline-block w-full">
                <h3 className="font-bold text-brand-800 mb-3">💡 Onde comprar mais barato?</h3>
                <div className="space-y-2">
                  {[ // Mock for optimization...
                    { store: 'Atacadão Aricanduva', total: estimatedTotal * 0.88, distance: '2.3km', items: uncheckedItems.length },
                    { store: 'Assaí Marginal Tietê', total: estimatedTotal * 0.91, distance: '5.1km', items: uncheckedItems.length - 1 },
                    { store: 'Carrefour Pinheiros', total: estimatedTotal * 0.97, distance: '3.8km', items: uncheckedItems.length },
                  ].map((opt, idx) => (
                    <div
                      key={opt.store}
                      className={`flex items-center justify-between rounded-xl p-3 ${idx === 0 ? 'bg-white ring-2 ring-brand-300' : 'bg-white'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        {idx === 0 && <span className="text-sm">🏆</span>}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{opt.store}</p>
                          <p className="text-xs text-gray-500">
                            <MapPin className="inline h-3 w-3" /> {opt.distance} · {opt.items} itens
                          </p>
                        </div>
                      </div>
                      <p className={`text-sm font-bold ${idx === 0 ? 'text-brand-600' : 'text-gray-700'}`}>
                        {formatPrice(opt.total)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unchecked items */}
            <div className="space-y-2 mb-4">
              {uncheckedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 transition-card"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 hover:border-brand-500 transition-colors"
                  />
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    {item.product_image_url && (
                      <img src={item.product_image_url} alt={item.product_name || item.custom_name || ''} className="h-8 w-8 object-contain" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product_name || item.custom_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qtd: {item.quantity}
                        {item.estimated_price && ` · ${formatPrice(item.estimated_price)}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Checked items */}
            {checkedItems.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                  ✓ Já comprados ({checkedItems.length})
                </p>
                <div className="space-y-2">
                  {checkedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 opacity-60"
                    >
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-white"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <p className="flex-1 text-sm text-gray-500 line-through truncate">
                        {item.product_name || item.custom_name}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {activeList.items.length === 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-3 text-lg font-bold text-gray-900">Lista vazia</h3>
                <p className="mt-1 text-gray-500">
                  Adicione produtos usando o campo acima ou busque e compare preços.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-3 text-lg font-bold text-gray-900">Você não tem listas</h3>
            <p className="mt-1 text-gray-500">
              Crie uma lista clicando no botão acima, ou adicione produtos diretamente da tela inicial.
            </p>
            <button
              onClick={addNewList}
              className="mt-6 mx-auto flex items-center gap-1 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Criar &quot;Minha Lista&quot;
            </button>
          </div>
        )}
      </main>

      <AIListModal
        open={showAIModal}
        onClose={() => setShowAIModal(false)}
        onConfirm={handleAIConfirm}
      />
    </div>
  );
}
