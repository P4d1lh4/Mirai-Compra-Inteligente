'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    User, MapPin, Home, Building2, Plus, Pencil, Trash2, Star,
    Save, ArrowLeft, Loader2, Check, X
} from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import {
    getProfile, updateProfile, addAddress, updateAddress as apiUpdateAddress,
    deleteAddress as apiDeleteAddress, setDefaultAddress,
    UserProfile, UserAddress,
} from '@/lib/api';

const LABEL_ICONS: Record<string, React.ReactNode> = {
    'Casa': <Home className="h-5 w-5" />,
    'Trabalho': <Building2 className="h-5 w-5" />,
};

const LABEL_OPTIONS = ['Casa', 'Trabalho', 'Outro'];

const STATES = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

interface AddressFormData {
    label: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
    is_default: boolean;
}

const emptyAddress: AddressFormData = {
    label: 'Casa',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    is_default: false,
};

export default function ProfilePage() {
    const router = useRouter();
    const { user, isLoading: authLoading, updateUser, token } = useAuth();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Profile form
    const [name, setName] = useState('');
    const [zipCode, setZipCode] = useState('');

    // Address form
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [addressForm, setAddressForm] = useState<AddressFormData>(emptyAddress);
    const [savingAddress, setSavingAddress] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !token) {
            router.push('/entrar');
        }
    }, [authLoading, token, router]);

    const loadProfile = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const data = await getProfile();
            setProfile(data);
            setName(data.name);
            setZipCode(data.zip_code || '');
        } catch {
            setError('Erro ao carregar perfil');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const showSuccess = (msg: string) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(null), 3000);
    };

    // Save profile
    const handleSaveProfile = async () => {
        setSaving(true);
        setError(null);
        try {
            const updated = await updateProfile({ name, zip_code: zipCode || null });
            setProfile(updated);
            updateUser({ name: updated.name, zip_code: updated.zip_code });
            showSuccess('Perfil atualizado com sucesso!');
        } catch {
            setError('Erro ao salvar perfil');
        } finally {
            setSaving(false);
        }
    };

    // Address CRUD
    const openAddForm = () => {
        setEditingAddressId(null);
        setAddressForm(emptyAddress);
        setShowAddressForm(true);
    };

    const openEditForm = (addr: UserAddress) => {
        setEditingAddressId(addr.id);
        setAddressForm({
            label: addr.label,
            street: addr.street,
            number: addr.number || '',
            complement: addr.complement || '',
            neighborhood: addr.neighborhood || '',
            city: addr.city,
            state: addr.state,
            zip_code: addr.zip_code,
            is_default: addr.is_default,
        });
        setShowAddressForm(true);
    };

    const handleSaveAddress = async () => {
        setSavingAddress(true);
        setError(null);
        try {
            if (editingAddressId) {
                await apiUpdateAddress(editingAddressId, {
                    label: addressForm.label,
                    street: addressForm.street,
                    number: addressForm.number || undefined,
                    complement: addressForm.complement || undefined,
                    neighborhood: addressForm.neighborhood || undefined,
                    city: addressForm.city,
                    state: addressForm.state,
                    zip_code: addressForm.zip_code,
                });
                showSuccess('Endereço atualizado!');
            } else {
                await addAddress({
                    label: addressForm.label,
                    street: addressForm.street,
                    number: addressForm.number || undefined,
                    complement: addressForm.complement || undefined,
                    neighborhood: addressForm.neighborhood || undefined,
                    city: addressForm.city,
                    state: addressForm.state,
                    zip_code: addressForm.zip_code,
                    is_default: addressForm.is_default,
                });
                showSuccess('Endereço adicionado!');
            }
            setShowAddressForm(false);
            await loadProfile();
        } catch {
            setError('Erro ao salvar endereço');
        } finally {
            setSavingAddress(false);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!confirm('Remover este endereço?')) return;
        try {
            await apiDeleteAddress(id);
            showSuccess('Endereço removido');
            await loadProfile();
        } catch {
            setError('Erro ao remover endereço');
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            await setDefaultAddress(id);
            showSuccess('Endereço padrão atualizado');
            await loadProfile();
        } catch {
            setError('Erro ao definir endereço padrão');
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                </div>
            </div>
        );
    }

    if (!user || !profile) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
            <Header />

            <main className="mx-auto max-w-2xl px-4 py-8">
                {/* Back */}
                <button
                    onClick={() => router.back()}
                    className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                </button>

                {/* Page title */}
                <div className="mb-8 flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100">
                        <User className="h-7 w-7 text-brand-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900">Meu Perfil</h1>
                        <p className="text-sm text-gray-500">Gerencie suas informações e endereços</p>
                    </div>
                </div>

                {/* Success / Error messages */}
                {success && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 animate-fadeIn">
                        <Check className="h-4 w-4" />
                        {success}
                    </div>
                )}
                {error && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        <X className="h-4 w-4" />
                        {error}
                        <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* ═══ Personal Info ═══ */}
                <section className="rounded-2xl border border-gray-100 bg-white p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="h-5 w-5 text-brand-500" />
                        Dados Pessoais
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={profile.email}
                                disabled
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
                            />
                            <p className="mt-1 text-xs text-gray-400">O email não pode ser alterado</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                            <input
                                type="text"
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                                placeholder="00000-000"
                                maxLength={9}
                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving || (!name.trim())}
                                className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Salvar
                            </button>
                        </div>
                    </div>
                </section>

                {/* ═══ Addresses ═══ */}
                <section className="rounded-2xl border border-gray-100 bg-white p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-brand-500" />
                            Meus Endereços
                        </h2>
                        <button
                            onClick={openAddForm}
                            className="flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Adicionar
                        </button>
                    </div>

                    {/* Address list */}
                    {profile.addresses.length === 0 && !showAddressForm && (
                        <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
                            <MapPin className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                            <p className="text-sm font-medium text-gray-500">Nenhum endereço cadastrado</p>
                            <p className="mt-1 text-xs text-gray-400">
                                Adicione endereços para facilitar a busca por produtos da sua região.
                            </p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {profile.addresses.map((addr) => (
                            <div
                                key={addr.id}
                                className="group rounded-xl border border-gray-100 bg-gray-50/50 p-4 hover:border-brand-200 hover:bg-brand-50/20 transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                                            {LABEL_ICONS[addr.label] || <MapPin className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900">{addr.label}</span>
                                                {addr.is_default && (
                                                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700 uppercase tracking-wider">
                                                        Padrão
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-0.5 text-sm text-gray-600">
                                                {addr.street}{addr.number ? `, ${addr.number}` : ''}
                                                {addr.complement ? ` - ${addr.complement}` : ''}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {addr.neighborhood ? `${addr.neighborhood}, ` : ''}
                                                {addr.city} - {addr.state} · {addr.zip_code}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!addr.is_default && (
                                            <button
                                                onClick={() => handleSetDefault(addr.id)}
                                                title="Definir como padrão"
                                                className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                                            >
                                                <Star className="h-4 w-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => openEditForm(addr)}
                                            title="Editar"
                                            className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAddress(addr.id)}
                                            title="Remover"
                                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ═══ Address Form (Add / Edit) ═══ */}
                    {showAddressForm && (
                        <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50/30 p-5 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-900 mb-4">
                                {editingAddressId ? 'Editar Endereço' : 'Novo Endereço'}
                            </h3>

                            <div className="grid gap-3">
                                {/* Label */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                                    <div className="flex gap-2">
                                        {LABEL_OPTIONS.map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => setAddressForm(prev => ({ ...prev, label: opt }))}
                                                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${addressForm.label === opt
                                                        ? 'border-brand-400 bg-brand-100 text-brand-700'
                                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Street + Number */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Rua / Avenida</label>
                                        <input
                                            type="text"
                                            value={addressForm.street}
                                            onChange={(e) => setAddressForm(prev => ({ ...prev, street: e.target.value }))}
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Número</label>
                                        <input
                                            type="text"
                                            value={addressForm.number}
                                            onChange={(e) => setAddressForm(prev => ({ ...prev, number: e.target.value }))}
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Complement + Neighborhood */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Complemento</label>
                                        <input
                                            type="text"
                                            value={addressForm.complement}
                                            onChange={(e) => setAddressForm(prev => ({ ...prev, complement: e.target.value }))}
                                            placeholder="Apto, Bloco..."
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Bairro</label>
                                        <input
                                            type="text"
                                            value={addressForm.neighborhood}
                                            onChange={(e) => setAddressForm(prev => ({ ...prev, neighborhood: e.target.value }))}
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* City + State + ZIP */}
                                <div className="grid grid-cols-5 gap-3">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Cidade</label>
                                        <input
                                            type="text"
                                            value={addressForm.city}
                                            onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">UF</label>
                                        <select
                                            value={addressForm.state}
                                            onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                                            className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none bg-white"
                                        >
                                            <option value="">--</option>
                                            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">CEP</label>
                                        <input
                                            type="text"
                                            value={addressForm.zip_code}
                                            onChange={(e) => setAddressForm(prev => ({ ...prev, zip_code: e.target.value }))}
                                            placeholder="00000-000"
                                            maxLength={9}
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Default toggle (only on create) */}
                                {!editingAddressId && (
                                    <label className="flex items-center gap-2 cursor-pointer mt-1">
                                        <input
                                            type="checkbox"
                                            checked={addressForm.is_default}
                                            onChange={(e) => setAddressForm(prev => ({ ...prev, is_default: e.target.checked }))}
                                            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                                        />
                                        <span className="text-sm text-gray-700">Definir como endereço padrão</span>
                                    </label>
                                )}

                                {/* Actions */}
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        onClick={() => setShowAddressForm(false)}
                                        className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveAddress}
                                        disabled={savingAddress || !addressForm.street || !addressForm.city || !addressForm.state || !addressForm.zip_code}
                                        className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {savingAddress ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        {editingAddressId ? 'Atualizar' : 'Salvar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* Member since */}
                <p className="mt-6 text-center text-xs text-gray-400">
                    Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </p>
            </main>
        </div>
    );
}
