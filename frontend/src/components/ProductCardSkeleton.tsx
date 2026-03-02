'use client'

export default function ProductCardSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-4 animate-pulse">
      {/* Image skeleton */}
      <div className="mb-3 h-32 rounded-xl bg-gray-200" />

      {/* Category badge skeleton */}
      <div className="h-5 w-24 rounded-full bg-gray-200 mb-2" />

      {/* Title skeleton */}
      <div className="h-4 w-full rounded bg-gray-200 mb-2" />
      <div className="h-4 w-5/6 rounded bg-gray-200 mb-3" />

      {/* Brand skeleton */}
      <div className="h-3 w-1/3 rounded bg-gray-100 mb-3" />

      {/* Price & stores skeleton */}
      <div className="flex items-end justify-between mb-2">
        <div className="h-6 w-24 rounded bg-gray-200" />
        <div className="h-5 w-16 rounded-full bg-gray-100" />
      </div>

      {/* Savings badge skeleton */}
      <div className="h-4 w-32 rounded bg-gray-100 mb-3" />

      {/* CTA skeleton */}
      <div className="h-8 rounded-xl bg-gray-200" />
    </div>
  )
}
