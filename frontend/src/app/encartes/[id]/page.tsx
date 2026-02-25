'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import { FlyerDetail } from '@/components/FlyerCard';
import { getActiveFlyers, Flyer } from '@/lib/api';

export default function FlyerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const flyerId = params.id as string;

  const [flyer, setFlyer] = useState<Flyer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // In MVP, fetch all flyers and find the one we want
        // In production, use getFlyer(flyerId) directly
        const flyers = await getActiveFlyers();
        const found = flyers.find((f) => f.id === flyerId);
        setFlyer(found || null);
      } catch {
        // API not available
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [flyerId]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        {loading && (
          <div className="animate-pulse space-y-4">
            <div className="h-16 rounded-2xl bg-gray-200" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 rounded-2xl bg-gray-100" />
              ))}
            </div>
          </div>
        )}

        {!loading && flyer && (
          <FlyerDetail
            flyer={flyer}
            onProductClick={(pid) => router.push(`/produto/${pid}`)}
          />
        )}

        {!loading && !flyer && (
          <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-lg font-bold text-gray-900">Encarte não encontrado</h3>
            <button
              onClick={() => router.push('/encartes')}
              className="mt-4 rounded-xl bg-brand-600 px-6 py-2 text-sm font-semibold text-white"
            >
              Ver todos os encartes
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
