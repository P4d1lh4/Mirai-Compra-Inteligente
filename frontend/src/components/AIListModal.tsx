'use client';

import { X, Sparkles, Send, ShoppingCart, Loader2, ArrowRight, RotateCcw } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { formatPrice } from '@/lib/utils';

interface AIItem {
    name: string;
    quantity: number;
    estimated_price: number | null;
}

interface AIListResult {
    name: string;
    items: AIItem[];
}

interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: (result: AIListResult) => void;
}

const SUGGESTIONS = [
    { emoji: '🥩', label: 'Churrasco 10 pessoas' },
    { emoji: '🛒', label: 'Compras do mês família 4' },
    { emoji: '☕', label: 'Café da manhã semanal' },
    { emoji: '🎉', label: 'Festa infantil 20 crianças' },
    { emoji: '🥗', label: 'Dieta fitness semanal' },
    { emoji: '🍝', label: 'Jantar italiano para 6' },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export default function AIListModal({ open, onClose, onConfirm }: Props) {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AIListResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [phase, setPhase] = useState<'input' | 'loading' | 'result'>('input');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
        if (!open) {
            setPrompt('');
            setResult(null);
            setError(null);
            setPhase('input');
            setLoading(false);
        }
    }, [open]);

    const handleSubmit = async (text?: string) => {
        const finalPrompt = text || prompt;
        if (!finalPrompt.trim()) return;

        setPrompt(finalPrompt);
        setPhase('loading');
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE}/ai/generate-list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: finalPrompt }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ detail: 'Erro ao gerar lista' }));
                throw new Error(err.detail || 'Erro ao gerar lista');
            }

            const data: AIListResult = await res.json();
            setResult(data);
            setPhase('result');
        } catch (e: any) {
            setError(e.message || 'Erro ao conectar com a IA');
            setPhase('input');
        } finally {
            setLoading(false);
        }
    };

    const totalEstimated = result?.items.reduce(
        (sum, item) => sum + (item.estimated_price || 0) * item.quantity,
        0
    ) || 0;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm ai-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg mx-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl ai-slide-up max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex-shrink-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-6 py-5 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_60%)]" />
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">Criar com IA</h2>
                                <p className="text-xs text-purple-200">Descreva o que você precisa comprar</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Content area */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {/* INPUT PHASE */}
                    {phase === 'input' && (
                        <div className="ai-fade-in">
                            {/* Suggestion chips */}
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                💡 Sugestões rápidas
                            </p>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s.label}
                                        onClick={() => handleSubmit(s.label)}
                                        className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 hover:shadow-sm"
                                    >
                                        <span>{s.emoji}</span>
                                        {s.label}
                                    </button>
                                ))}
                            </div>

                            {error && (
                                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 ai-fade-in">
                                    ⚠️ {error}
                                </div>
                            )}

                            {/* Custom prompt */}
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                ✏️ Ou descreva sua lista
                            </p>
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                    placeholder="Ex: Compras para um mês, família de 4..."
                                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all"
                                />
                                <button
                                    onClick={() => handleSubmit()}
                                    disabled={!prompt.trim()}
                                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 disabled:hover:from-purple-600 transition-all shadow-lg shadow-purple-200"
                                >
                                    <Send className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* LOADING PHASE */}
                    {phase === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-12 ai-fade-in">
                            <div className="relative mb-6">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                                    <Sparkles className="h-8 w-8 text-purple-600 ai-pulse" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                                    <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Gerando sua lista...</h3>
                            <p className="text-sm text-gray-500 text-center max-w-xs">
                                A IA está montando a melhor lista para: <span className="font-medium text-purple-700">"{prompt}"</span>
                            </p>
                            <div className="flex gap-1.5 mt-6">
                                <span className="ai-dot h-2.5 w-2.5 rounded-full bg-purple-500" style={{ animationDelay: '0s' }} />
                                <span className="ai-dot h-2.5 w-2.5 rounded-full bg-purple-500" style={{ animationDelay: '0.2s' }} />
                                <span className="ai-dot h-2.5 w-2.5 rounded-full bg-purple-500" style={{ animationDelay: '0.4s' }} />
                            </div>
                        </div>
                    )}

                    {/* RESULT PHASE */}
                    {phase === 'result' && result && (
                        <div className="ai-fade-in">
                            {/* List header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100">
                                    <ShoppingCart className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{result.name}</h3>
                                    <p className="text-xs text-gray-500">{result.items.length} itens · Total estimado: <span className="font-semibold text-purple-700">{formatPrice(totalEstimated)}</span></p>
                                </div>
                            </div>

                            {/* Items list */}
                            <div className="space-y-2 mb-4 max-h-[35vh] overflow-y-auto pr-1">
                                {result.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 ai-item-appear"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                                        </div>
                                        {item.estimated_price && (
                                            <span className="text-sm font-semibold text-purple-700 ml-3 flex-shrink-0">
                                                {formatPrice(item.estimated_price)}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Total bar */}
                            <div className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white mb-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-purple-200">Total estimado</span>
                                    <span className="text-xl font-extrabold">{formatPrice(totalEstimated)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer buttons */}
                <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4 bg-gray-50/80">
                    {phase === 'result' && result ? (
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setPhase('input');
                                    setResult(null);
                                    setPrompt('');
                                }}
                                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex-1"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Refazer
                            </button>
                            <button
                                onClick={() => onConfirm(result)}
                                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3 text-sm font-bold text-white hover:from-brand-600 hover:to-brand-700 transition-all shadow-lg shadow-brand-200 flex-[2]"
                            >
                                <ShoppingCart className="h-4 w-4" />
                                Usar esta lista
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    ) : phase === 'input' ? (
                        <button
                            onClick={onClose}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
