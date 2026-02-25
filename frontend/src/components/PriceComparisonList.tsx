'use client';

import {
  MapPin, ExternalLink, ShoppingCart, TrendingDown,
  Store, Wifi, Bell, Plus
} from 'lucide-react';
import { PriceComparison } from '@/lib/api';
import { formatPrice, formatDistance, timeSince, savingsPercent, chainColorClass, cn } from '@/lib/utils';

interface PriceComparisonListProps {
  prices: PriceComparison[];
  onAddToList?: (price: PriceComparison) => void;
  onSetAlert?: () => void;
}

export default function PriceComparisonList({
  prices,
  onAddToList,
  onSetAlert,
}: PriceComparisonListProps) {
  if (prices.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
        <Store className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-3 text-gray-500">Nenhum preço encontrado para este produto.</p>
      </div>
    );
  }

  const cheapest = prices[0].price;
  const mostExpensive = prices[prices.length - 1].price;
  const savingsTotal = mostExpensive - cheapest;

  return (
    <div className="space-y-3">
      {/* Savings banner */}
      {savingsTotal > 1 && (
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 p-4 text-white">
          <TrendingDown className="h-6 w-6 flex-shrink-0" />
          <div>
            <p className="font-bold">
              Economize até {formatPrice(savingsTotal)}
            </p>
            <p className="text-sm text-brand-100">
              Diferença entre o melhor e pior preço
            </p>
          </div>
        </div>
      )}

      {/* Alert button */}
      {onSetAlert && (
        <button
          onClick={onSetAlert}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-200 bg-brand-50 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
        >
          <Bell className="h-4 w-4" />
          Avisar quando o preço cair
        </button>
      )}

      {/* Price list */}
      {prices.map((price, idx) => {
        const isCheapest = idx === 0;
        const savings = savingsPercent(mostExpensive, price.price);

        return (
          <div
            key={`${price.chain_slug}-${price.store_name}-${idx}`}
            className={cn(
              'relative rounded-2xl border bg-white p-4 transition-card',
              isCheapest
                ? 'border-brand-300 ring-2 ring-brand-100'
                : 'border-gray-100'
            )}
          >
            {/* Cheapest badge */}
            {isCheapest && (
              <div className="absolute -top-2.5 left-4 rounded-full bg-brand-600 px-3 py-0.5 text-xs font-bold text-white">
                🏆 Menor preço
              </div>
            )}

            <div className="flex items-start justify-between gap-3">
              {/* Store info */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {/* Chain color dot */}
                <div
                  className={cn(
                    'mt-1 h-10 w-10 flex-shrink-0 rounded-xl flex items-center justify-center text-white text-xs font-bold',
                    chainColorClass(price.chain_slug)
                  )}
                >
                  {price.chain_name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {price.chain_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {price.store_name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    {price.distance_km !== null && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" />
                        {formatDistance(price.distance_km)}
                      </span>
                    )}
                    {price.is_online && (
                      <span className="flex items-center gap-0.5 text-blue-500">
                        <Wifi className="h-3 w-3" />
                        Online
                      </span>
                    )}
                    <span>{timeSince(price.seen_at)}</span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0">
                {price.is_promotion && price.original_price && (
                  <p className="text-xs text-gray-400 line-through">
                    {formatPrice(price.original_price)}
                  </p>
                )}
                <p
                  className={cn(
                    'text-xl font-bold',
                    isCheapest ? 'text-brand-600' : 'text-gray-900'
                  )}
                >
                  {formatPrice(price.price)}
                </p>
                {price.is_promotion && price.promotion_label && (
                  <span className="inline-block rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700 mt-1">
                    {price.promotion_label}
                  </span>
                )}
                {savings > 0 && !isCheapest && (
                  <p className="text-xs text-red-500 mt-0.5">+{savings}%</p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-3 flex gap-2">
              {price.is_online && price.ecommerce_url && (
                <a
                  href={price.ecommerce_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent-500 py-2.5 text-sm font-semibold text-white hover:bg-accent-600 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Comprar Online
                </a>
              )}
              {!price.is_online && price.distance_km !== null && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(price.store_address + ', ' + price.store_city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  Ver rota
                </a>
              )}
              {onAddToList && (
                <button
                  onClick={() => onAddToList(price)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Lista
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
