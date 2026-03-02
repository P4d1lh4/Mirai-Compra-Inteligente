'use client';

import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  initialValue?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = 'Buscar produto, marca ou categoria...',
  autoFocus = false,
  initialValue = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim().length >= 2) {
        onSearch(query.trim());
      }
    },
    [query, onSearch]
  );

  const handleClear = () => {
    setQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label htmlFor="search-input" className="sr-only">
        Buscar produtos
      </label>
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-5 w-5 text-gray-400 pointer-events-none" aria-hidden="true" />
        <input
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-label="Campo de busca de produtos"
          className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-20 text-base
                     shadow-sm placeholder:text-gray-400
                     focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20
                     transition-all duration-200"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Limpar busca"
            className="absolute right-20 p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          disabled={query.trim().length < 2}
          aria-label={`Buscar por ${query || 'produtos'}`}
          className="absolute right-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white
                     hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors duration-200"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
