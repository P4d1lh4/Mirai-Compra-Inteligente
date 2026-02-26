'use client';

import Header from '@/components/Header';
import { Bell, BellOff, TrendingDown, ArrowDown, Plus, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface DemoAlert {
  id: string;
  productName: string;
  currentPrice: number;
  targetPrice: number | null;
  lastKnownPrice: number;
  isActive: boolean;
  triggered: boolean;
  priceDropPercent: number | null;
}

export default function AlertasPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [alerts, setAlerts] = useState<DemoAlert[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/entrar');
    }
  }, [user, authLoading, router]);

  const toggleAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const activeAlerts = alerts.filter((a) => a.isActive);
  const triggeredAlerts = alerts.filter((a) => a.triggered && a.isActive);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin mb-4" />
        <p className="text-gray-500">Carregando alertas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🔔 Alertas de Preço</h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitore produtos e seja avisado quando o preço cair.
            </p>
          </div>
        </div>

        {/* Triggered alerts banner */}
        {triggeredAlerts.length > 0 && (
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-5 w-5" />
              <p className="font-bold">
                {triggeredAlerts.length} {triggeredAlerts.length === 1 ? 'produto caiu' : 'produtos caíram'} de preço!
              </p>
            </div>
            <p className="text-sm text-white/80">
              Aproveite as oportunidades antes que os preços subam novamente.
            </p>
          </div>
        )}

        {/* Alerts list */}
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-2xl border bg-white p-4 transition-card ${alert.triggered && alert.isActive
                ? 'border-orange-200 ring-1 ring-orange-100'
                : 'border-gray-100'
                } ${!alert.isActive ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {alert.productName}
                    </h3>
                    {alert.triggered && alert.isActive && (
                      <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                        <ArrowDown className="h-3 w-3" />
                        -{alert.priceDropPercent}%
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-baseline gap-3">
                    <div>
                      <p className="text-xs text-gray-400">Preço atual</p>
                      <p className={`text-lg font-bold ${alert.triggered ? 'text-brand-600' : 'text-gray-900'
                        }`}>
                        {formatPrice(alert.currentPrice)}
                      </p>
                    </div>
                    {alert.targetPrice && (
                      <div>
                        <p className="text-xs text-gray-400">Meta</p>
                        <p className="text-sm font-medium text-gray-500">
                          {formatPrice(alert.targetPrice)}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-400">Anterior</p>
                      <p className="text-sm text-gray-400 line-through">
                        {formatPrice(alert.lastKnownPrice)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className={`rounded-xl p-2 transition-colors ${alert.isActive
                      ? 'bg-brand-50 text-brand-600 hover:bg-brand-100'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    title={alert.isActive ? 'Pausar alerta' : 'Reativar alerta'}
                  >
                    {alert.isActive ? (
                      <Bell className="h-5 w-5" />
                    ) : (
                      <BellOff className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Progress bar to target */}
              {alert.targetPrice && alert.isActive && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                    <span>Preço atual</span>
                    <span>Meta: {formatPrice(alert.targetPrice)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${alert.currentPrice <= alert.targetPrice ? 'bg-brand-500' : 'bg-orange-400'
                        }`}
                      style={{
                        width: `${Math.min(100, Math.max(5, (1 - (alert.currentPrice - alert.targetPrice) / alert.lastKnownPrice) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty state */}
        {alerts.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-3 text-lg font-bold text-gray-900">Nenhum alerta ativo</h3>
            <p className="mt-1 text-gray-500">
              Busque um produto e clique em "Avisar quando cair" para criar seu primeiro alerta.
            </p>
          </div>
        )}

        {/* Tip */}
        <div className="mt-6 rounded-2xl bg-blue-50 border border-blue-100 p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Dica:</strong> Crie alertas para os produtos que você compra com frequência.
            O Mirai monitora preços em tempo real e te avisa assim que encontrar uma oferta melhor.
          </p>
        </div>
      </main>
    </div>
  );
}
