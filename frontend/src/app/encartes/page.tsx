'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { FlyerCard, FlyerDetail } from '@/components/FlyerCard';
import { getActiveFlyers, getStoreChains, Flyer, StoreChain } from '@/lib/api';

export default function EncartesPage() {
  const router = useRouter();
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [chains, setChains] = useState<StoreChain[]>([]);
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [flyerData, chainData] = await Promise.all([
          getActiveFlyers(selectedChain || undefined),
          getStoreChains(),
        ]);
        setFlyers(flyerData);
        setChains(chainData);
      } catch {
        // API not available
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedChain]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          📰 Encartes da Semana
        </h1>
        <p className="text-gray-500 mb-6">
          Confira as ofertas dos encartes semanais dos supermercados da sua região.
        </p>

        {/* Chain filter */}
        <div className="flex gap-2 overflow-x-auto pb-4">
          <button
            onClick={() => setSelectedChain(null)}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${selectedChain === null
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
          >
            Todos
          </button>
          {chains.map((chain) => (
            <button
              key={chain.slug}
              onClick={() => setSelectedChain(chain.slug === selectedChain ? null : chain.slug)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${selectedChain === chain.slug
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
            >
              {chain.name}
            </button>
          ))}
        </div>

        {/* Flyers grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-white border border-gray-100 animate-pulse">
                <div className="h-16 rounded-t-2xl bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-20 rounded-xl bg-gray-100" />
                  <div className="h-4 rounded bg-gray-100 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : flyers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flyers.map((flyer) => (
              <FlyerCard
                key={flyer.id}
                flyer={flyer}
                onClick={() => router.push(`/encartes/${flyer.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-lg font-bold text-gray-900">Nenhum encarte disponível</h3>
            <p className="mt-1 text-gray-500">
              Os encartes são atualizados semanalmente. Volte em breve!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
