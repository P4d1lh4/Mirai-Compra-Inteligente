'use client';

import { useRouter } from 'next/navigation';
import { Bot, LineChart, BellRing, ChevronRight, ShoppingCart, ShieldCheck, Sparkles, MapPin, Zap, ExternalLink, Check } from 'lucide-react';
import Header from './Header';

export default function LandingPage() {
    const router = useRouter();

    const features = [
        {
            title: 'Busca pelo Menor Preço',
            description: 'Encontre o menor preço em tempo real comparando entre as principais redes de supermercados da sua região.',
            icon: LineChart,
            color: 'text-brand-600',
            bg: 'bg-brand-50',
        },
        {
            title: 'Assistente de IA',
            description: 'Seu Personal Shopper digital. Diga o que precisa e receba recomendações otimizadas para o seu bolso.',
            icon: Bot,
            color: 'text-accent-500',
            bg: 'bg-accent-50',
        },
        {
            title: 'Cesta Inteligente',
            description: 'Crie listas e receba alertas imediatos quando os produtos que você quer entrarem em promoção.',
            icon: BellRing,
            color: 'text-brand-500',
            bg: 'bg-brand-50',
        },
    ];

    const steps = [
        {
            number: '01',
            title: 'Busque o que precisa',
            desc: 'Pesquise pelo nome do produto ou peça ajuda ao nosso Assistente de IA para recomendações.',
        },
        {
            number: '02',
            title: 'Compare preços locais',
            desc: 'O Mirai verifica na hora os preços dos supermercados próximos à sua casa.',
        },
        {
            number: '03',
            title: 'Compre onde é mais barato',
            desc: 'Veja onde ir ou o link direto para comprar online. A média de economia é de 23% por compra.',
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans selection:bg-brand-500/20">
            <Header />

            <main>
                {/* HERO SECTION */}
                <section className="relative overflow-hidden pt-24 pb-32">
                    {/* Background decoration */}
                    <div className="absolute inset-0 -z-10 bg-white">
                        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
                            <div className="h-[500px] w-[500px] rounded-full bg-brand-50/50 blur-3xl"></div>
                        </div>
                        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
                            <div className="h-[400px] w-[400px] rounded-full bg-accent-50 blur-3xl"></div>
                        </div>
                        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40"></div>
                    </div>

                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-xl shadow-brand-500/20">
                            <ShoppingCart className="h-10 w-10 text-white" />
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 mb-8">
                            <Sparkles className="h-4 w-4 text-brand-600" />
                            <span className="text-sm font-semibold text-brand-700">O 1º Personal Shopper com IA do Brasil</span>
                        </div>

                        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                            Sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-500">IA pessoal</span> para economizar no supermercado.
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl leading-relaxed">
                            O Mirai é seu assistente de compras inteligente. Ele pesquisa, compara e te avisa onde está mais barato, para você nunca mais pagar caro nas compras do mês.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
                            <button
                                onClick={() => router.push('/cadastro')}
                                className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-brand-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-1 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0"
                            >
                                Criar Conta Grátis
                                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </button>
                            <button
                                onClick={() => router.push('/entrar')}
                                className="flex w-full sm:w-auto items-center justify-center rounded-full bg-white border-2 border-gray-200 px-8 py-4 text-base font-bold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
                            >
                                Já tenho uma conta
                            </button>
                        </div>

                        <div className="mt-12 flex items-center justify-center gap-6 text-sm font-medium text-gray-500">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-brand-500" />
                                100% Gratuito
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-brand-500" />
                                Busca Local
                            </div>
                        </div>
                    </div>
                </section>

                {/* LOGO CLOUD (Opcional - Lojas suportadas) */}
                <section className="border-y border-gray-100 bg-white py-10">
                    <div className="mx-auto max-w-7xl px-4 text-center">
                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">Em breve comparando nas maiores redes</p>
                        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale">
                            <span className="text-xl font-bold font-serif">Carrefour</span>
                            <span className="text-xl font-bold tracking-tighter">ASSAÍ</span>
                            <span className="text-xl font-extrabold italic">Atacadão</span>
                            <span className="text-xl font-bold">Extra</span>
                            <span className="text-xl font-bold text-gray-800">Pão de Açúcar</span>
                        </div>
                    </div>
                </section>

                {/* PRICING SECTION */}
                <section className="py-24 relative overflow-hidden border-y border-brand-800">
                    {/* Estética brand do footer/cta */}
                    <div className="absolute inset-0 bg-brand-900"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl drop-shadow-sm text-white">
                                Escolha seu plano <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-400">Mirai</span>
                            </h2>
                            <p className="mt-4 text-lg text-brand-100/80">
                                Desbloqueie todo o poder da nossa IA para economizar ainda mais.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                            {/* Plano 1: Grátis (Cyber Cyan #00E5FF) */}
                            <div className="flex flex-col rounded-3xl border border-[#00E5FF]/30 bg-gray-900/60 p-8 shadow-lg shadow-[#00E5FF]/10 backdrop-blur-md transition-transform hover:-translate-y-1">
                                <h3 className="text-xl font-bold text-[#00E5FF] mb-2">Grátis</h3>
                                <div className="mb-6 flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-white">R$ 0</span>
                                    <span className="text-sm font-medium text-gray-400">/ mês</span>
                                </div>
                                <ul className="flex-1 space-y-4 mb-8 text-gray-300">
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 shrink-0"><Check className="h-5 w-5 text-[#00E5FF]" /></div>
                                        <span className="text-sm leading-relaxed"><strong className="text-white font-semibold">5 Tokens</strong> de Pesquisa IA / semana (Busca SerpApi)</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 shrink-0"><Check className="h-5 w-5 text-[#00E5FF]" /></div>
                                        <span className="text-sm leading-relaxed">Lista Inteligente IA (Sincronização Limitada)</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 shrink-0"><Check className="h-5 w-5 text-[#00E5FF]" /></div>
                                        <span className="text-sm leading-relaxed">Assistente Conversacional (Acesso semanal limitado)</span>
                                    </li>
                                </ul>
                                <button className="w-full rounded-full border-2 border-[#00E5FF] bg-transparent px-6 py-3 font-bold text-[#00E5FF] transition-colors hover:bg-[#00E5FF] hover:text-gray-900">
                                    Começar agora
                                </button>
                            </div>

                            {/* Plano 2: Básico (Digital Mint #00C853) */}
                            <div className="flex flex-col rounded-3xl border border-[#00C853]/30 bg-gray-900/60 p-8 shadow-lg shadow-[#00C853]/5 backdrop-blur-md transition-transform hover:-translate-y-1">
                                <h3 className="text-xl font-bold text-[#00C853] mb-2">Básico</h3>
                                <div className="mb-6 flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-white">R$ 29,90</span>
                                    <span className="text-sm font-medium text-gray-400">/ mês</span>
                                </div>
                                <ul className="flex-1 space-y-4 mb-8 text-gray-300">
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 shrink-0"><Check className="h-5 w-5 text-[#00C853]" /></div>
                                        <span className="text-sm leading-relaxed"><strong className="text-white font-semibold">50 Tokens</strong> de Pesquisa IA / semana</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 shrink-0"><Check className="h-5 w-5 text-[#00C853]" /></div>
                                        <span className="text-sm leading-relaxed">Lista Inteligente IA Completa</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 shrink-0"><Check className="h-5 w-5 text-[#00C853]" /></div>
                                        <span className="text-sm leading-relaxed">Assistente Conversacional (Acesso diário com limite de turnos)</span>
                                    </li>
                                </ul>
                                <button className="w-full rounded-full bg-[#00C853] px-6 py-3 font-bold text-white transition-all hover:bg-[#00e65f] shadow-lg shadow-[#00C853]/20 hover:shadow-[#00C853]/40">
                                    Assinar Básico
                                </button>
                            </div>

                            {/* Plano 3: Pro (Gray) - COM SELO EM BREVE */}
                            <div className="flex flex-col rounded-3xl border border-gray-600/50 bg-gray-900/80 p-8 shadow-lg backdrop-blur-md relative transform lg:-translate-y-4 transition-transform hover:-translate-y-6">
                                <div className="absolute top-4 right-4 rounded-full border border-gray-500 bg-gray-900/90 px-3 py-1 text-xs font-bold uppercase text-gray-400 shadow-sm backdrop-blur-sm">
                                    Em breve
                                </div>
                                <h3 className="text-xl font-bold text-gray-400 mb-2 relative z-10">Pro</h3>
                                <div className="mb-6 flex items-baseline gap-1 relative z-10">
                                    <span className="text-4xl font-extrabold text-white opacity-50">R$ 59,90</span>
                                    <span className="text-sm font-medium text-gray-500">/ mês</span>
                                </div>
                                <ul className="flex-1 space-y-4 mb-8 text-gray-400 relative z-10">
                                    <li className="flex items-start gap-3 opacity-60">
                                        <div className="mt-1 shrink-0"><Check className="h-5 w-5 text-gray-500" /></div>
                                        <span className="text-sm leading-relaxed"><strong className="text-gray-300 font-semibold">100 Tokens</strong> de Pesquisa IA / semana (Dobro do Básico)</span>
                                    </li>
                                    <li className="flex items-start gap-3 opacity-60">
                                        <div className="mt-1 shrink-0"><Check className="h-5 w-5 text-gray-500" /></div>
                                        <span className="text-sm leading-relaxed">Lista Inteligente IA Completa</span>
                                    </li>
                                    <li className="flex items-start gap-3 opacity-60">
                                        <div className="mt-1 shrink-0"><Check className="h-5 w-5 text-gray-500" /></div>
                                        <span className="text-sm leading-relaxed">Assistente Conversacional (Acesso diário alto)</span>
                                    </li>
                                </ul>
                                <button disabled className="w-full rounded-full bg-gray-600 px-6 py-3 font-bold text-gray-300 opacity-50 cursor-not-allowed relative z-10">
                                    Aguarde
                                </button>
                            </div>

                            {/* Plano 4: Personalizado (Gray) - COM SELO EM BREVE */}
                            <div className="flex flex-col rounded-3xl border border-gray-600/30 bg-gray-900/60 p-8 shadow-lg backdrop-blur-md relative transition-transform hover:-translate-y-1">
                                <div className="absolute top-4 right-4 rounded-full border border-gray-500 bg-gray-900/90 px-3 py-1 text-xs font-bold uppercase text-gray-400 shadow-sm backdrop-blur-sm">
                                    Em breve
                                </div>
                                <h3 className="text-xl font-bold text-gray-400 mb-2">Personalizado</h3>
                                <div className="mb-6 flex items-baseline gap-1">
                                    <span className="text-3xl font-extrabold text-white opacity-50">Sob consulta</span>
                                    <span className="text-sm font-medium text-gray-500">/ mês</span>
                                </div>
                                <ul className="flex-1 space-y-4 mb-8 text-gray-400">
                                    <li className="flex items-start gap-3 opacity-60">
                                        <div className="mt-1 shrink-0"><Check className="h-5 w-5 text-gray-500" /></div>
                                        <span className="text-sm leading-relaxed">Tokens de Pesquisa IA Customizados</span>
                                    </li>
                                    <li className="flex items-start gap-3 opacity-60">
                                        <div className="mt-1 shrink-0"><Check className="h-5 w-5 text-gray-500" /></div>
                                        <span className="text-sm leading-relaxed">Funcionalidades Exclusivas</span>
                                    </li>
                                    <li className="flex items-start gap-3 opacity-60">
                                        <div className="mt-1 shrink-0"><Check className="h-5 w-5 text-gray-500" /></div>
                                        <span className="text-sm leading-relaxed">Suporte Dedicado & API</span>
                                    </li>
                                </ul>
                                <button disabled className="w-full rounded-full bg-gray-600 px-6 py-3 font-bold text-gray-300 opacity-50 cursor-not-allowed">
                                    Indisponível
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURES SECTION */}
                <section className="py-24 bg-gray-50">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                Tudo o que você precisa para <span className="text-brand-600">comprar melhor</span>
                            </h2>
                            <p className="mt-4 text-lg text-gray-600">Ferramentas inteligentes projetadas para colocar dinheiro de volta no seu bolso.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {features.map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="relative flex flex-col rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 group"
                                >
                                    <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bg} transition-transform group-hover:scale-110`}>
                                        <feature.icon className={`h-7 w-7 ${feature.color}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                    <p className="text-gray-500 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS SECTION */}
                <section className="py-24 bg-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
                                    Como o Mirai te faz economizar?
                                </h2>
                                <p className="text-lg text-gray-600 mb-10">
                                    O nosso motor de IA varre as lojas locais e a internet em tempo real para garantir que você nunca seja enganado por falsas promoções.
                                </p>

                                <div className="space-y-8">
                                    {steps.map((step, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold">
                                                    {step.number}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                                                <p className="text-gray-600">{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Mockup UI Image/Illustration */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-brand-100 to-accent-100 rounded-3xl transform rotate-3 scale-105 -z-10"></div>
                                <div className="rounded-3xl border border-gray-200 bg-white shadow-2xl p-6 relative z-10">
                                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                                        <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                                            <Bot className="h-6 w-6 text-brand-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Assistente Mirai</p>
                                            <p className="text-xs text-gray-500">IA de Compras</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-start">
                                            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-700 max-w-[85%]">
                                                Olá! Encontrei o Azeite Gallo 500ml por <strong className="text-brand-600">R$ 29,90</strong> no supermercado a 2km daqui. Quer que eu adicione à sua lista?
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <div className="bg-brand-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-[85%]">
                                                Sim, por favor! E me avise se o preço do Café baixar.
                                            </div>
                                        </div>
                                        <div className="flex justify-start">
                                            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-700 max-w-[85%]">
                                                <Zap className="inline h-4 w-4 text-brand-500 mb-1 mr-1" />
                                                Lista atualizada! Vou monitorar o café e te mando um alerta assim que cair de preço.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA SECTION */}
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-brand-900"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                    <div className="relative mx-auto max-w-4xl px-4 text-center z-10">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl mb-6">
                            Pronto para parar de pagar caro?
                        </h2>
                        <p className="text-lg text-brand-100 mb-10 max-w-2xl mx-auto">
                            Junte-se às pessoas que já estão usando inteligência artificial para otimizar suas compras de supermercado.
                        </p>
                        <button
                            onClick={() => router.push('/cadastro')}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-brand-900 shadow-xl transition-all hover:scale-105 hover:bg-brand-50"
                        >
                            Criar minha conta gratuita
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="bg-white py-12 border-t border-gray-200">
                <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-6 w-6 text-brand-600" />
                        <span className="text-xl font-bold tracking-tight text-gray-900">
                            Mirai
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} Mirai Inteligência em Compras. Todos os direitos reservados.
                    </p>
                    <div className="flex gap-6 text-sm text-gray-600">
                        <a href="#" className="hover:text-brand-600 transition-colors">Termos</a>
                        <a href="#" className="hover:text-brand-600 transition-colors">Privacidade</a>
                        <a href="#" className="flex items-center gap-1 hover:text-brand-600 transition-colors">
                            Contato <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
