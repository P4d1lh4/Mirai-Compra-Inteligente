'use client';

import { ShoppingCart, MapPin, ArrowRight, Tag, Heart, Loader2 } from 'lucide-react';
import { Product, getShoppingLists, createShoppingList, addShoppingListItem } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';
import { memo, type MouseEvent, useState } from 'react';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

function ProductCardComponent({ product, onClick }: ProductCardProps) {
  const { user } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  const hasPrices = product.min_price !== null;
  const priceRange =
    product.min_price !== null && product.max_price !== null
      ? product.max_price - product.min_price
      : 0;

  const handleSave = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!user) {
      router.push('/entrar');
      return;
    }

    setIsAdding(true);
    try {
      let lists = await getShoppingLists();
      let defaultList = lists.find(l => l.name === 'Minha Lista');

      if (!defaultList) {
        defaultList = await createShoppingList({ name: 'Minha Lista' });
      }

      await addShoppingListItem(defaultList.id, {
        product_id: product.id,
        quantity: 1,
      });
      success('Produto adicionado à sua lista!');
    } catch (err) {
      console.error(err);
      error('Erro ao adicionar à lista. Tente novamente.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={onClick}
      className="group w-full rounded-2xl border border-gray-100 bg-white p-4 text-left
                 shadow-sm transition-card hover:border-brand-200 relative"
    >
      <button
        onClick={handleSave}
        disabled={isAdding}
        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors z-10 disabled:opacity-50"
      >
        {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
      </button>
      {/* Product image placeholder */}
      <div className="mb-3 flex h-32 items-center justify-center rounded-xl bg-gray-50 overflow-hidden">
        {product.image_url ? (
          <div className="flex h-full w-full items-center justify-center text-4xl text-gray-300">
            <ShoppingCart className="h-12 w-12" />
          </div>
        ) : (
          <ShoppingCart className="h-12 w-12 text-gray-300" />
        )}
      </div>

      {/* Category badge */}
      {product.category && (
        <span className="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 mb-2">
          {product.category.icon} {product.category.name}
        </span>
      )}

      {/* Product name */}
      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-brand-700 transition-colors">
        {product.name}
      </h3>

      {/* Brand & unit */}
      {(product.brand || product.unit) && (
        <p className="mt-0.5 text-xs text-gray-500">
          {product.brand && <span>{product.brand}</span>}
          {product.brand && product.unit && <span> · </span>}
          {product.unit && <span>{product.unit}</span>}
        </p>
      )}

      {/* Price section */}
      <div className="mt-3 flex items-end justify-between">
        {hasPrices ? (
          <div>
            <p className="text-lg font-bold text-brand-600">
              {formatPrice(product.min_price!)}
            </p>
            {priceRange > 0.01 && (
              <p className="text-xs text-gray-400">
                até {formatPrice(product.max_price!)}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Preço indisponível</p>
        )}

        {/* Store count */}
        {product.store_count > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
            <MapPin className="h-3 w-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-600">
              {product.store_count} {product.store_count === 1 ? 'loja' : 'lojas'}
            </span>
          </div>
        )}
      </div>

      {/* Savings badge */}
      {priceRange > 1 && (
        <div className="mt-2 flex items-center gap-1 text-xs font-medium text-orange-600">
          <Tag className="h-3 w-3" />
          <span>Economize até {formatPrice(priceRange)}</span>
        </div>
      )}

      {/* CTA */}
      <div className="mt-3 flex items-center justify-center gap-1 rounded-xl bg-brand-50 py-2 text-sm font-semibold text-brand-700 group-hover:bg-brand-100 transition-colors">
        Comparar preços
        <ArrowRight className="h-4 w-4" />
      </div>
    </button>
  );
}

const ProductCard = memo(ProductCardComponent)

export default ProductCard
