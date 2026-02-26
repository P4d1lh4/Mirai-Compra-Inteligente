'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Mail, Lock, Eye, EyeOff, User, MapPin, ArrowRight, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const passwordChecks = {
        length: password.length >= 6,
        match: password.length > 0 && password === confirmPassword,
    };

    const validate = (): boolean => {
        if (name.trim().length < 2) {
            setError('Insira seu nome completo.');
            return false;
        }
        if (!email.includes('@') || !email.includes('.')) {
            setError('Insira um email válido.');
            return false;
        }
        if (!passwordChecks.length) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return false;
        }
        if (!passwordChecks.match) {
            setError('As senhas não coincidem.');
            return false;
        }
        return true;
    };

    const formatZipCode = (value: string) => {
        const numbers = value.replace(/\D/g, '').slice(0, 8);
        if (numbers.length > 5) {
            return numbers.slice(0, 5) + '-' + numbers.slice(5);
        }
        return numbers;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (!validate()) return;

        setIsLoading(true);
        try {
            await register(name.trim(), email, password, zipCode.replace('-', '') || undefined);
            router.push('/listas');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro ao criar conta.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left — Branding panel */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-brand-700 via-brand-600 to-aurora-600 items-center justify-center overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/5 auth-float" />
                <div className="absolute bottom-20 left-10 h-60 w-60 rounded-full bg-white/5 auth-float" style={{ animationDelay: '3s' }} />
                <div className="absolute top-1/3 right-1/4 h-40 w-40 rounded-full bg-white/5 auth-float" style={{ animationDelay: '1.5s' }} />

                <div className="relative z-10 max-w-md px-8 text-center text-white flex flex-col items-center">
                    <Link href="/" className="flex flex-col items-center justify-center transition-transform hover:-translate-y-0.5 mb-8">
                        <div className="flex items-baseline gap-2 leading-none">
                            <span className="text-white font-black tracking-tight leading-none" style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: "3.5rem" }}>Mirai</span>
                            <span className="text-white/80 font-normal tracking-[0.05em] leading-none" style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "1.25rem", marginBottom: "4px" }}>未来</span>
                        </div>
                        <div className="h-[2px] w-[200px] rounded-full bg-gradient-to-r from-white via-white/60 to-transparent mt-2.5 mb-3" />
                        <span className="text-[0.65rem] tracking-[0.25em] uppercase text-white/80 leading-none" style={{ fontFamily: "'DM Sans', sans-serif" }}>AI · Compras Inteligentes</span>
                    </Link>
                    <p className="text-lg text-white/90 leading-relaxed max-w-sm">
                        Crie sua conta gratuita e descubra os melhores preços de supermercado na sua região.
                    </p>

                    <div className="mt-10 grid grid-cols-3 gap-4 text-center">
                        {[
                            { value: '1000+', label: 'Produtos' },
                            { value: '50+', label: 'Lojas' },
                            { value: '30%', label: 'Economia' },
                        ].map((stat) => (
                            <div key={stat.label} className="rounded-2xl bg-white/10 backdrop-blur-sm px-3 py-4">
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-xs text-white/70 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right — register form */}
            <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md auth-form-appear">
                    {/* Mobile Logo Mirai */}
                    <div className="lg:hidden flex justify-center mb-10">
                        <Link href="/" className="flex flex-col items-center transition-transform hover:-translate-y-0.5">
                            <div className="flex items-baseline gap-1.5 leading-none">
                                <span className="text-brand-700 font-black tracking-tight leading-none" style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: "2.25rem" }}>Mirai</span>
                                <span className="text-brand-500 font-normal tracking-[0.05em] leading-none" style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "1rem", marginBottom: "2px" }}>未来</span>
                            </div>
                            <div className="h-[2px] w-[160px] rounded-full bg-gradient-to-r from-brand-700 via-brand-500 to-transparent mt-2 mb-2.5" />
                            <span className="text-[0.55rem] tracking-[0.22em] uppercase text-gray-400 leading-none" style={{ fontFamily: "'DM Sans', sans-serif" }}>AI · Compras Inteligentes</span>
                        </Link>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Criar conta</h2>
                    <p className="text-gray-500 mb-8">
                        Preencha os dados abaixo para começar a economizar.
                    </p>

                    {error && (
                        <div className="mb-6 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 auth-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Nome completo
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Maria Silva"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-12 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Confirmar senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="confirm-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repita a senha"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                                />
                            </div>
                        </div>

                        {/* Password validation indicators */}
                        {password.length > 0 && (
                            <div className="flex gap-4 text-xs auth-form-appear">
                                <span className={`flex items-center gap-1 ${passwordChecks.length ? 'text-aurora-600' : 'text-gray-400'}`}>
                                    <Check className="h-3.5 w-3.5" /> 6+ caracteres
                                </span>
                                <span className={`flex items-center gap-1 ${passwordChecks.match ? 'text-aurora-600' : 'text-gray-400'}`}>
                                    <Check className="h-3.5 w-3.5" /> Senhas iguais
                                </span>
                            </div>
                        )}

                        {/* ZIP code (optional) */}
                        <div>
                            <label htmlFor="zip-code" className="block text-sm font-medium text-gray-700 mb-1.5">
                                CEP <span className="text-gray-400 font-normal">(opcional)</span>
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="zip-code"
                                    type="text"
                                    value={zipCode}
                                    onChange={(e) => setZipCode(formatZipCode(e.target.value))}
                                    placeholder="00000-000"
                                    maxLength={9}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/25 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Criar conta
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-500">
                        Já tem uma conta?{' '}
                        <Link href="/entrar" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                            Entrar
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
