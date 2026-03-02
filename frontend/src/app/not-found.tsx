import Link from 'next/link'
import { Search } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <Search className="w-16 h-16 text-slate-400" />
        </div>
        <h1 className="text-6xl font-bold text-slate-900 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">Página não encontrada</h2>
        <p className="text-slate-600 mb-8">
          A página que você procura não existe ou foi removida. Verifique a URL e tente novamente.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar ao início
          </Link>
          <Link
            href="/listas"
            className="px-6 py-2 bg-slate-200 text-slate-900 font-medium rounded-lg hover:bg-slate-300 transition-colors"
          >
            Ir para listas
          </Link>
        </div>
      </div>
    </main>
  )
}
