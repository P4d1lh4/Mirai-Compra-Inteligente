/** Utility functions. */

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDistance(km: number | null): string {
  if (km === null) return '';
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(dateStr));
}

export function timeSince(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return 'Agora há pouco';
  if (diffHours < 24) return `${diffHours}h atrás`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return formatDate(dateStr);
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function savingsPercent(original: number, current: number): number {
  if (!original || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}

/** Chain slug to a warm readable color class */
export function chainColorClass(slug: string): string {
  const map: Record<string, string> = {
    atacadao: 'bg-orange-500',
    assai: 'bg-blue-800',
    carrefour: 'bg-blue-600',
    'pao-de-acucar': 'bg-red-600',
    extra: 'bg-red-500',
    'sao-vicente': 'bg-green-600',
    sonda: 'bg-blue-500',
    dia: 'bg-red-700',
  };
  return map[slug] || 'bg-gray-500';
}
