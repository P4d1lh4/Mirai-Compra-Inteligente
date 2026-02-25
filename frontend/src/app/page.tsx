'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  TrendingDown, Zap, ShoppingCart, ArrowRight,
  DollarSign, MapPin, BarChart3, Sparkles
} from 'lucide-react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import ProductCard from '@/components/ProductCard';
import CategoryPills from '@/components/CategoryPills';
import { FlyerCard } from '@/components/FlyerCard';
import {
  searchProducts, getCategories, getActiveFlyers,
  searchShoppingOffers,
  Product, Category, Flyer, SerpApiShoppingItem,
} from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useGeolocation } from '@/hooks/useGeolocation';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [total, setTotal] = useState(0);
  const [shoppingOffers, setShoppingOffers] = useState<SerpApiShoppingItem[]>([]);
  const [shoppingSource, setShoppingSource] = useState<string | null>(null);
  const geo = useGeolocation();

  // Load categories and flyers on mount
  useEffect(() => {
    async function loadInitial() {
      try {
        const [cats, flyerData] = await Promise.all([
          getCategories(),
          getActiveFlyers(),
        ]);
        setCategories(cats);
        setFlyers(flyerData);
      } catch {
        // API not running — use empty arrays
        setCategories([]);
      }
    }
    loadInitial();
  }, []);

  // Auto-search from URL param (e.g. from AI assistant)
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl && searchFromUrl.trim()) {
      handleSearch(searchFromUrl.trim());
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);
    setHasSearched(true);
    setLoading(true);
    setShoppingOffers([]);
    setShoppingSource(null);
    try {
      const result = await searchProducts(searchQuery, {
        category: selectedCategory || undefined,
        lat: geo.latitude ?? undefined,
        lng: geo.longitude ?? undefined,
      });
      setProducts(result.items);
      setTotal(result.total);

      if (result.total === 0) {
        try {
          const shopping = await searchShoppingOffers(searchQuery, {
            ordenar_preco: true,
            num: 12,
            location: geo.locationString ?? undefined,
          });
          setShoppingOffers(shopping.resultados);
          setShoppingSource(shopping.fonte);
        } catch {
          setShoppingOffers([]);
          setShoppingSource(null);
        }
      }
    } catch {
      // API error — show empty state or handle error properly
      setProducts([]);
      setTotal(0);
      setShoppingOffers([]);
      setShoppingSource(null);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, geo.latitude, geo.longitude, geo.locationString]);

  const handleCategoryChange = useCallback((slug: string | null) => {
    setSelectedCategory(slug);
    if (query) {
      handleSearch(query);
    }
  }, [query, handleSearch]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />

      <main className="mx-auto max-w-7xl px-4">
        {/* Hero section */}
        {!hasSearched && (
          <section className="py-8 md:py-16">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
                <ShoppingCart className="h-8 w-8 text-brand-600" />
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900">
                Encontre o{' '}
                <span className="text-brand-600">menor preço</span>
                <br />
                perto de você
              </h1>
              <p className="mt-3 text-lg text-gray-500 max-w-xl mx-auto">
                Compare preços de supermercados, crie listas inteligentes
                e economize todo mês.
              </p>
            </div>

            <div className="mt-8 mx-auto max-w-2xl">
              <SearchBar
                onSearch={handleSearch}
                autoFocus
                placeholder="Ex: Azeite Gallo 500ml, Leite Ninho, Coca-Cola..."
              />
            </div>

            {/* Quick search suggestions */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {['Arroz 5kg', 'Coca-Cola 2L', 'Café Melitta', 'Leite'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSearch(suggestion)}
                  className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm text-gray-600 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Stats row */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { icon: DollarSign, label: 'Produtos comparados', value: '33.000+' },
                { icon: MapPin, label: 'Lojas mapeadas', value: '12 redes' },
                { icon: TrendingDown, label: 'Economia média', value: '23%' },
                { icon: Sparkles, label: 'Usuários ativos', value: '5.000+' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center rounded-2xl bg-white border border-gray-100 p-4"
                >
                  <stat.icon className="h-6 w-6 text-brand-500 mb-2" />
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="mt-16">
              <h2 className="text-center text-2xl font-bold text-gray-900 mb-8">
                Como funciona
              </h2>
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {[
                  {
                    step: '1',
                    icon: '🔍',
                    title: 'Busque o produto',
                    desc: 'Digite o nome do produto que você precisa e veja preços de todas as lojas da região.',
                  },
                  {
                    step: '2',
                    icon: '📊',
                    title: 'Compare preços',
                    desc: 'Veja comparação horizontal com preços de loja física e online, com distância e rota.',
                  },
                  {
                    step: '3',
                    icon: '💰',
                    title: 'Economize',
                    desc: 'Compre onde for mais barato. Crie listas inteligentes e receba alertas de queda de preço.',
                  },
                ].map((step) => (
                  <div
                    key={step.step}
                    className="rounded-2xl bg-white border border-gray-100 p-6 text-center"
                  >
                    <div className="text-4xl mb-3">{step.icon}</div>
                    <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 mb-2">
                      {step.step}
                    </div>
                    <h3 className="font-bold text-gray-900">{step.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Flyers section */}
            {flyers.length > 0 && (
              <div className="mt-16">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    📰 Encartes da semana
                  </h2>
                  <button
                    onClick={() => router.push('/encartes')}
                    className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    Ver todos <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {flyers.slice(0, 3).map((flyer) => (
                    <FlyerCard
                      key={flyer.id}
                      flyer={flyer}
                      onClick={() => router.push(`/encartes/${flyer.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Search results */}
        {hasSearched && (
          <section className="py-6">
            <div className="mb-6 max-w-2xl mx-auto">
              <SearchBar onSearch={handleSearch} initialValue={query} />
            </div>

            {/* Category filter */}
            <div className="mb-4">
              <CategoryPills
                categories={categories}
                selected={selectedCategory}
                onSelect={handleCategoryChange}
              />
            </div>

            {/* Results header */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {loading
                  ? 'Buscando...'
                  : `${total} resultado${total !== 1 ? 's' : ''} para "${query}"`}
              </h2>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 animate-pulse">
                    <div className="h-32 rounded-xl bg-gray-100" />
                    <div className="mt-3 h-4 rounded bg-gray-100 w-3/4" />
                    <div className="mt-2 h-3 rounded bg-gray-100 w-1/2" />
                    <div className="mt-3 h-6 rounded bg-gray-100 w-1/3" />
                  </div>
                ))}
              </div>
            )}

            {/* Product grid */}
            {!loading && products.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => router.push(`/produto/${product.id}`)}
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && products.length === 0 && (shoppingOffers?.length ?? 0) === 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-gray-900">
                  Nenhum produto encontrado
                </h3>
                <p className="mt-1 text-gray-500">
                  Tente buscar por outro termo ou remova os filtros.
                </p>
              </div>
            )}

            {/* Shopping offers fallback */}
            {!loading && products.length === 0 && (shoppingOffers?.length ?? 0) > 0 && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
                  <h3 className="text-base font-bold text-brand-900">
                    Ofertas encontradas na web
                  </h3>
                  <p className="mt-1 text-sm text-brand-700">
                    Resultado da busca externa via Google Shopping ({shoppingSource || 'serpapi'}).
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {(shoppingOffers || []).map((offer, index) => (
                    <a
                      key={`${offer.link}-${index}`}
                      href={offer.link}
                      className="rounded-2xl border border-gray-100 bg-white p-4 hover:border-brand-200 hover:bg-brand-50/30 transition-colors"
                    >
                      <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                        {offer.produto}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">{offer.loja}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-lg font-extrabold text-brand-700">
                          {offer.preco_formatado || formatPrice(offer.preco)}
                        </span>
                        <span className="text-xs font-medium text-brand-700">
                          Ver oferta →
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

import { Suspense } from 'react';

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Carregando...</div>}>
      <HomeContent />
    </Suspense>
  );
}
