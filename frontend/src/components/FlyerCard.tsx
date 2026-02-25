'use client';

import { Tag, Clock, ChevronRight } from 'lucide-react';
import { Flyer, FlyerItem } from '@/lib/api';
import { formatPrice, formatDate, chainColorClass, cn } from '@/lib/utils';

interface FlyerCardProps {
  flyer: Flyer;
  onClick: () => void;
}

export function FlyerCard({ flyer, onClick }: FlyerCardProps) {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-2xl border border-gray-100 bg-white overflow-hidden transition-card text-left"
    >
      {/* Chain header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 text-white',
          chainColorClass(flyer.chain.slug)
        )}
      >
        <div>
          <p className="font-bold">{flyer.chain.name}</p>
          <p className="text-xs opacity-80">{flyer.title}</p>
        </div>
        <div className="text-right text-xs opacity-80">
          <p className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            até {formatDate(flyer.valid_until)}
          </p>
        </div>
      </div>

      {/* Preview items */}
      <div className="p-3">
        <div className="grid grid-cols-3 gap-2">
          {flyer.items.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-gray-50 p-2 text-center"
            >
              <div className="flex h-10 items-center justify-center text-2xl text-gray-300">
                <Tag className="h-5 w-5" />
              </div>
              <p className="mt-1 text-[10px] text-gray-600 line-clamp-1">
                {item.raw_name}
              </p>
              <p className="text-xs font-bold text-brand-600">
                {formatPrice(item.price)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-1 text-sm font-medium text-brand-600 group-hover:text-brand-700">
          Ver todas as {flyer.items.length} ofertas
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </button>
  );
}

interface FlyerDetailProps {
  flyer: Flyer;
  onProductClick?: (productId: string) => void;
}

export function FlyerDetail({ flyer, onProductClick }: FlyerDetailProps) {
  return (
    <div>
      <div
        className={cn(
          'rounded-2xl px-5 py-4 text-white mb-4',
          chainColorClass(flyer.chain.slug)
        )}
      >
        <h2 className="text-lg font-bold">{flyer.title}</h2>
        <p className="text-sm opacity-80">
          Válido de {formatDate(flyer.valid_from)} até {formatDate(flyer.valid_until)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {flyer.items.map((item) => (
          <button
            key={item.id}
            onClick={() => item.product_id && onProductClick?.(item.product_id)}
            className="rounded-2xl border border-gray-100 bg-white p-3 text-left transition-card"
          >
            <div className="flex h-20 items-center justify-center rounded-xl bg-gray-50">
              <Tag className="h-8 w-8 text-gray-300" />
            </div>
            <p className="mt-2 text-xs text-gray-600 line-clamp-2">{item.raw_name}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-bold text-brand-600">
                {formatPrice(item.price)}
              </span>
              {item.original_price && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(item.original_price)}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
