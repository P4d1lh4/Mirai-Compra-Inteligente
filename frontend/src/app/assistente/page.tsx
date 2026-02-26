'use client';

import Header from '@/components/Header';
import {
    Send, Sparkles, Loader2, MessageSquare, ShoppingBag,
    Search, RotateCcw, ArrowRight, Bot, User
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface Suggestion {
    name: string;
    search_query: string;
    reason: string;
}

const STARTERS = [
    { emoji: '👟', label: 'Quero comprar um tênis para corrida' },
    { emoji: '📱', label: 'Preciso de um celular novo' },
    { emoji: '🎧', label: 'Quero um fone de ouvido bom' },
    { emoji: '💻', label: 'Estou procurando um notebook' },
    { emoji: '🏋️', label: 'Preciso de equipamentos para academia' },
    { emoji: '🎮', label: 'Quero comprar um console de videogame' },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export default function AssistentePage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/entrar');
        }
    }, [user, authLoading, router]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, suggestions]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const sendMessage = async (text?: string) => {
        const finalText = text || input;
        if (!finalText.trim() || loading) return;

        const userMsg: Message = { role: 'user', content: finalText.trim() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setError(null);
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ detail: 'Erro ao conectar com a IA' }));
                throw new Error(err.detail || 'Erro ao conectar com a IA');
            }

            const data = await res.json();
            setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
        } catch (e: any) {
            setError(e.message || 'Erro ao conectar com a IA');
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleSuggest = async () => {
        if (loadingSuggestions || messages.length < 2) return;
        setLoadingSuggestions(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE}/ai/chat/suggest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages.map((m) => ({ role: m.role, content: m.content })),
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ detail: 'Erro ao gerar sugestões' }));
                throw new Error(err.detail || 'Erro ao gerar sugestões');
            }

            const data = await res.json();
            setSuggestions(data.suggestions);
        } catch (e: any) {
            setError(e.message || 'Erro ao gerar sugestões');
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const resetChat = () => {
        setMessages([]);
        setSuggestions(null);
        setError(null);
        setInput('');
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const canShowResults = messages.length >= 2 && !suggestions;

    if (authLoading || (!user && !authLoading)) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-brand-500 animate-spin mb-4" />
                <p className="text-gray-500">Carregando assistente...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1 flex flex-col mx-auto w-full max-w-2xl relative">
                {/* Chat area */}
                <div className="flex-1 overflow-y-auto px-4 py-6 pb-36 space-y-1">
                    {/* Welcome state */}
                    {messages.length === 0 && !suggestions && (
                        <div className="flex flex-col items-center justify-center py-12 chat-fade-in">
                            {/* Hero icon */}
                            <div className="relative mb-6">
                                <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-purple-200">
                                    <Sparkles className="h-10 w-10 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg">
                                    <MessageSquare className="h-4 w-4 text-white" />
                                </div>
                            </div>

                            <h1 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">
                                Assistente de Compras
                            </h1>
                            <p className="text-gray-500 text-center max-w-sm mb-8 text-sm leading-relaxed">
                                Me diga o que você quer comprar e eu vou te ajudar a encontrar o produto perfeito! 🛍️
                            </p>

                            {/* Starter suggestions */}
                            <div className="w-full max-w-md space-y-2">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">
                                    Comece com uma dessas ideias
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {STARTERS.map((s) => (
                                        <button
                                            key={s.label}
                                            onClick={() => sendMessage(s.label)}
                                            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-left text-sm font-medium text-gray-700 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 hover:shadow-md group"
                                        >
                                            <span className="text-xl group-hover:scale-110 transition-transform">
                                                {s.emoji}
                                            </span>
                                            <span>{s.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-3 mb-4 chat-bubble-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                            style={{ animationDelay: `${Math.min(idx * 50, 200)}ms` }}
                        >
                            {msg.role === 'assistant' && (
                                <div className="flex-shrink-0 mt-1">
                                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                        <Bot className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                            )}

                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-md shadow-lg shadow-purple-200/50'
                                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-md shadow-sm'
                                    }`}
                            >
                                {msg.content}
                            </div>

                            {msg.role === 'user' && (
                                <div className="flex-shrink-0 mt-1">
                                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                                        <User className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {loading && (
                        <div className="flex gap-3 mb-4 justify-start chat-fade-in">
                            <div className="flex-shrink-0 mt-1">
                                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                    <Bot className="h-4 w-4 text-white" />
                                </div>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-5 py-4 shadow-sm">
                                <div className="flex gap-1.5">
                                    <span className="typing-dot h-2.5 w-2.5 rounded-full bg-purple-400" style={{ animationDelay: '0s' }} />
                                    <span className="typing-dot h-2.5 w-2.5 rounded-full bg-purple-400" style={{ animationDelay: '0.2s' }} />
                                    <span className="typing-dot h-2.5 w-2.5 rounded-full bg-purple-400" style={{ animationDelay: '0.4s' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mx-auto max-w-md rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 chat-fade-in mb-4">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Suggestions results */}
                    {suggestions && (
                        <div className="mt-6 chat-fade-in">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                                    <ShoppingBag className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Produtos Recomendados</h3>
                                    <p className="text-xs text-gray-500">
                                        {suggestions.length} sugestões baseadas na sua conversa
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {suggestions.map((s, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200 ai-item-appear"
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100 text-xs font-bold text-purple-700">
                                                        {idx + 1}
                                                    </span>
                                                    <h4 className="text-sm font-bold text-gray-900 truncate">
                                                        {s.name}
                                                    </h4>
                                                </div>
                                                <p className="text-xs text-gray-500 leading-relaxed mt-1">
                                                    {s.reason}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => router.push(`/?search=${encodeURIComponent(s.search_query)}`)}
                                                className="flex-shrink-0 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:from-brand-600 hover:to-brand-700 transition-all shadow-md shadow-brand-200"
                                            >
                                                Buscar
                                                <Search className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reset button */}
                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={resetChat}
                                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Nova consulta
                                </button>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Bottom bar */}
                {!suggestions && (
                    <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-gray-50 via-gray-50 to-gray-50/0 pt-6 pb-4 px-4 md:pb-4 safe-area-pb">
                        {/* See results button */}
                        {canShowResults && (
                            <div className="flex justify-center mb-3 chat-fade-in">
                                <button
                                    onClick={handleSuggest}
                                    disabled={loadingSuggestions}
                                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-60 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {loadingSuggestions ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Gerando sugestões...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4" />
                                            ✨ Ver Resultados
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Input */}
                        <div className="flex gap-2 max-w-2xl mx-auto">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder={
                                    messages.length === 0
                                        ? 'Descreva o que você quer comprar...'
                                        : 'Digite sua resposta...'
                                }
                                disabled={loading}
                                className="flex-1 rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-sm placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all shadow-sm disabled:opacity-60"
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || loading}
                                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 disabled:hover:from-violet-600 transition-all shadow-lg shadow-purple-200 hover:scale-105 active:scale-95"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                            </button>
                        </div>

                        <p className="text-[10px] text-gray-400 text-center mt-2">
                            Assistente IA · Respostas podem não ser 100% precisas
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
