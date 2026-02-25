'use client';

interface CategoryPillsProps {
  categories: { slug: string; name: string; icon: string | null }[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
}

export default function CategoryPills({ categories, selected, onSelect }: CategoryPillsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${selected === null
            ? 'bg-brand-600 text-white'
            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
      >
        Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => onSelect(cat.slug === selected ? null : cat.slug)}
          className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${selected === cat.slug
              ? 'bg-brand-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
        >
          {cat.icon} {cat.name}
        </button>
      ))}
    </div>
  );
}
