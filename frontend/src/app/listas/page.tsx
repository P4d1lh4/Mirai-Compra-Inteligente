'use client';

import Header from '@/components/Header';
import AIListModal from '@/components/AIListModal';
import {
  ShoppingCart, Plus, Trash2, Check, BarChart3,
  ChevronDown, ChevronUp, MapPin, Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { formatPrice } from '@/lib/utils';

// Local-first demo shopping list (works without API)
interface LocalItem {
  id: string;
  name: string;
  quantity: number;
  checked: boolean;
  estimatedPrice: number | null;
}

interface LocalList {
  id: string;
  name: string;
  items: LocalItem[];
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ListasPage() {
  const [lists, setLists] = useState<LocalList[]>([
    { id: 'default-1', name: 'Minha Lista', items: [] }
  ]);
  const [activeListId, setActiveListId] = useState<string>('default-1');
  const [newItemName, setNewItemName] = useState('');
  const [showOptimization, setShowOptimization] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  const handleAIConfirm = (result: { name: string; items: { name: string; quantity: number; estimated_price: number | null }[] }) => {
    const id = generateId();
    const newList: LocalList = {
      id,
      name: result.name,
      items: result.items.map((item) => ({
        id: generateId(),
        name: item.name,
        quantity: item.quantity,
        checked: false,
        estimatedPrice: item.estimated_price,
      })),
    };
    setLists((prev) => [...prev, newList]);
    setActiveListId(id);
    setShowAIModal(false);
  };

  const activeList = lists.find((l) => l.id === activeListId) || lists[0];

  const toggleItem = (itemId: string) => {
    setLists((prev) =>
      prev.map((list) =>
        list.id === activeListId
          ? {
            ...list,
            items: list.items.map((item) =>
              item.id === itemId ? { ...item, checked: !item.checked } : item
            ),
          }
          : list
      )
    );
  };

  const removeItem = (itemId: string) => {
    setLists((prev) =>
      prev.map((list) =>
        list.id === activeListId
          ? { ...list, items: list.items.filter((item) => item.id !== itemId) }
          : list
      )
    );
  };

  const addItem = () => {
    if (!newItemName.trim()) return;
    setLists((prev) =>
      prev.map((list) =>
        list.id === activeListId
          ? {
            ...list,
            items: [
              ...list.items,
              {
                id: generateId(),
                name: newItemName.trim(),
                quantity: 1,
                checked: false,
                estimatedPrice: null,
              },
            ],
          }
          : list
      )
    );
    setNewItemName('');
  };

  const addNewList = () => {
    const id = generateId();
    setLists((prev) => [
      ...prev,
      { id, name: `Lista ${prev.length + 1}`, items: [] },
    ]);
    setActiveListId(id);
  };

  const uncheckedItems = activeList?.items.filter((i) => !i.checked) || [];
  const checkedItems = activeList?.items.filter((i) => i.checked) || [];
  const estimatedTotal = uncheckedItems.reduce(
    (acc, item) => acc + (item.estimatedPrice || 0) * item.quantity,
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
        {lists.length > 1 && (
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

        {activeList && (
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
                disabled={!newItemName.trim()}
                className="rounded-xl bg-brand-600 px-4 py-3 text-white hover:bg-brand-700 disabled:opacity-40 transition-colors"
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
              <div className="mb-4 rounded-2xl border border-brand-200 bg-brand-50 p-4">
                <h3 className="font-bold text-brand-800 mb-3">💡 Onde comprar mais barato?</h3>
                <div className="space-y-2">
                  {[
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
                <p className="mt-2 text-xs text-brand-600 text-center font-medium">
                  * Faça login para ver cálculos em tempo real
                </p>
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
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      Qtd: {item.quantity}
                      {item.estimatedPrice && ` · ${formatPrice(item.estimatedPrice)}`}
                    </p>
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
                        {item.name}
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
