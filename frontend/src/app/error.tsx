'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <main className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="w-16 h-16 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Algo deu errado!</h1>
        <p className="text-slate-600 mb-6">
          Desculpe, ocorreu um erro inesperado. Por favor, tente novamente ou volte à página inicial.
        </p>
        {error.message && (
          <p className="text-sm text-slate-500 mb-6 p-3 bg-red-50 rounded-lg border border-red-200">
            {error.message}
          </p>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="px-6 py-2 bg-slate-200 text-slate-900 font-medium rounded-lg hover:bg-slate-300 transition-colors"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  )
}
