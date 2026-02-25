'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Share2, ShoppingCart, Bell } from 'lucide-react';
import Header from '@/components/Header';
import PriceComparisonList from '@/components/PriceComparisonList';
import { getProductWithPrices, ProductWithPrices } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductWithPrices | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        // Try to get user's location
        let lat: number | undefined;
        let lng: number | undefined;
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
          );
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch {
          // Location not available — that's ok
        }

        const data = await getProductWithPrices(productId, lat, lng);
        setProduct(data);
      } catch (e: any) {
        setError(e.message || 'Erro ao carregar produto');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="h-48 rounded-2xl bg-gray-100" />
            <div className="h-24 rounded-2xl bg-gray-100" />
            <div className="h-24 rounded-2xl bg-gray-100" />
            <div className="h-24 rounded-2xl bg-gray-100" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-12 text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-900">Produto não encontrado</h2>
          <p className="mt-2 text-gray-500">{error || 'Tente buscar novamente.'}</p>
          <button
            onClick={() => router.back()}
            className="mt-6 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Voltar
          </button>
        </main>
      </div>
    );
  }

  const cheapest = product.prices.length > 0 ? product.prices[0].price : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar aos resultados
        </button>

        {/* Product header */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 mb-4">
          <div className="flex gap-4">
            {/* Image placeholder */}
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50">
              <ShoppingCart className="h-10 w-10 text-gray-300" />
            </div>

            <div className="min-w-0 flex-1">
              {product.category && (
                <span className="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 mb-1">
                  {product.category.icon} {product.category.name}
                </span>
              )}
              <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                {product.brand && <span>{product.brand}</span>}
                {product.unit && <span>· {product.unit}</span>}
                {product.ean && <span className="text-xs text-gray-400">EAN: {product.ean}</span>}
              </div>
            </div>
          </div>

          {/* Price summary */}
          {cheapest !== null && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
              <div>
                <p className="text-xs font-medium text-brand-700">Menor preço encontrado</p>
                <p className="text-2xl font-extrabold text-brand-600">
                  {formatPrice(cheapest)}
                </p>
              </div>
              <div className="text-right text-xs text-gray-500">
                <p>em {product.prices.length} {product.prices.length === 1 ? 'loja' : 'lojas'}</p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `${product.name} — Mirai`,
                    text: cheapest
                      ? `${product.name} a partir de ${formatPrice(cheapest)} no Mirai`
                      : product.name,
                    url: window.location.href,
                  });
                }
              }}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <Share2 className="h-4 w-4" />
              Compartilhar
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
              <Bell className="h-4 w-4" />
              Criar alerta
            </button>
          </div>
        </div>

        {/* Price comparison list */}
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          Comparar preços ({product.prices.length} {product.prices.length === 1 ? 'oferta' : 'ofertas'})
        </h2>
        <PriceComparisonList
          prices={product.prices}
          onSetAlert={() => {/* TODO: open alert modal */ }}
        />
      </main>
    </div>
  );
}
