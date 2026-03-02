'use client';

import { ShoppingCart, Search, FileText, Bell, User, Menu, X, MessageSquare, LogOut, ChevronDown, MapPin, Navigation, Home, Building2, Check } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getProfile, UserAddress } from '@/lib/api';

const navItems = [
  { href: '/', label: 'Início', icon: Search },
  { href: '/encartes', label: 'Encartes', icon: FileText },
  { href: '/listas', label: 'Listas', icon: ShoppingCart },
  { href: '/assistente', label: 'Assistente', icon: MessageSquare },
  { href: '/alertas', label: 'Alertas', icon: Bell },
];

const LABEL_ICONS: Record<string, React.ReactNode> = {
  'Casa': <Home className="h-4 w-4" />,
  'Trabalho': <Building2 className="h-4 w-4" />,
};

// ── Location Switcher ──

function LocationSwitcher() {
  const geo = useGeolocation();
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchAddresses = useCallback(async () => {
    if (!token) return;
    try {
      const profile = await getProfile();
      setAddresses(profile.addresses);
    } catch { /* silent */ }
  }, [token]);

  useEffect(() => {
    if (open) fetchAddresses();
  }, [open, fetchAddresses]);

  const handleSelectAddress = (addr: UserAddress) => {
    geo.setManualLocation({
      city: addr.city,
      state: addr.state,
      latitude: addr.latitude,
      longitude: addr.longitude,
      label: addr.label,
    });
    setOpen(false);
  };

  const handleAutoLocation = () => {
    geo.clearManualLocation();
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Seletor de localização"
        className={cn(
          'hidden md:flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all cursor-pointer',
          open
            ? 'border-brand-300 bg-brand-50 text-brand-700 shadow-sm'
            : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200 hover:bg-gray-100'
        )}
      >
        <MapPin className="h-3.5 w-3.5 text-brand-500" />
        {geo.loading ? (
          <span className="w-20 h-3 rounded bg-gray-200 animate-pulse" />
        ) : (
          <span className="font-medium">{geo.displayString || 'Brasil'}</span>
        )}
        <ChevronDown className={cn('h-3 w-3 text-gray-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-72 rounded-xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50 py-1 z-50 animate-fadeIn">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Localização para buscas</p>
          </div>

          {/* Auto-detect */}
          <button
            onClick={handleAutoLocation}
            className={cn(
              'flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors',
              !geo.isManual ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'
            )}
          >
            <div className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
              !geo.isManual ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500'
            )}>
              <Navigation className="h-4 w-4" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="font-medium text-sm">Localização automática</p>
              <p className="text-[11px] text-gray-400 truncate">Detectada pelo navegador</p>
            </div>
            {!geo.isManual && <Check className="h-4 w-4 text-brand-500 shrink-0" />}
          </button>

          {/* Saved addresses */}
          {addresses.length > 0 && (
            <>
              <div className="px-3 py-1.5 border-t border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Meus endereços</p>
              </div>
              {addresses.map((addr) => {
                const isSelected = geo.isManual && geo.city === addr.city && geo.state === addr.state;
                return (
                  <button
                    key={addr.id}
                    onClick={() => handleSelectAddress(addr)}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                      isSelected ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <div className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      isSelected ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500'
                    )}>
                      {LABEL_ICONS[addr.label] || <MapPin className="h-4 w-4" />}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-medium text-sm">{addr.label}</p>
                      <p className="text-[11px] text-gray-400 truncate">{addr.city}, {addr.state}</p>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-brand-500 shrink-0" />}
                  </button>
                );
              })}
            </>
          )}

          {/* Manage link */}
          {token && (
            <div className="border-t border-gray-100 px-3 py-2">
              <Link
                href="/perfil"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                Gerenciar endereços →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── User Menu ──

function UserMenu({ name, onLogout }: { name: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-700 text-xs font-bold">
          {initials}
        </div>
        <span className="hidden sm:inline max-w-[120px] truncate">{name.split(' ')[0]}</span>
        <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50 py-1 z-50 auth-form-appear">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
          </div>
          <Link
            href="/perfil"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <User className="h-4 w-4" />
            Meu Perfil
          </Link>
          <button
            onClick={() => { setOpen(false); onLogout(); }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

// ── Header ──

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();

  if (pathname === '/entrar' || pathname === '/cadastro') return null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex flex-col justify-center transition-transform hover:-translate-y-0.5">
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="text-brand-700 font-black tracking-tight leading-none" style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: "1.75rem" }}>Mirai</span>
              <span className="text-brand-500 font-normal tracking-[0.05em] leading-none" style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "0.75rem", marginBottom: "2px" }}>未来</span>
            </div>
            <div className="h-[2px] w-[140px] rounded-full bg-gradient-to-r from-brand-700 via-brand-500 to-transparent mt-1.5 mb-2" />
            <span className="text-[0.45rem] tracking-[0.22em] uppercase text-muted leading-none" style={{ fontFamily: "'DM Sans', sans-serif" }}>AI · Compras Inteligentes</span>
          </Link>

          {/* Location switcher */}
          {user && <LocationSwitcher />}

          {/* Desktop nav */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="h-9 w-24 animate-pulse rounded-xl bg-gray-100" />
            ) : user ? (
              <UserMenu name={user.name} onLogout={logout} />
            ) : (
              <>
                <Link
                  href="/entrar"
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
                >
                  Criar conta
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white p-4">
            {user && (
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                      pathname === item.href
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}
            <div className={cn("mt-4", !user && "mt-0")}>
              {isLoading ? (
                <div className="h-11 w-full animate-pulse rounded-xl bg-gray-100" />
              ) : user ? (
                <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700 text-sm font-bold">
                      {user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[160px]">{user.name}</span>
                  </div>
                  <button
                    onClick={() => { setMobileMenuOpen(false); logout(); }}
                    className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/entrar"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-center text-sm font-medium hover:bg-gray-50"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/cadastro"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 rounded-xl bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    Criar conta
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile bottom navigation */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/90 backdrop-blur-lg safe-area-pb">
          <div className="flex justify-around py-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors',
                  pathname === item.href
                    ? 'text-brand-600'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
