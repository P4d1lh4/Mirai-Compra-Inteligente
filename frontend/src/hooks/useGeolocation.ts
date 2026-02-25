'use client';

import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
    latitude: number | null;
    longitude: number | null;
    city: string | null;
    state: string | null;
    /** Formatado como "Cidade, Estado, Brazil" para uso na SerpApi */
    locationString: string | null;
    /** Formato curto para UI: "Cidade, UF" */
    displayString: string | null;
    loading: boolean;
    error: string | null;
    /** True quando o usuário selecionou um endereço manualmente */
    isManual: boolean;
}

export interface ManualLocation {
    city: string;
    state: string; // UF (2 chars)
    latitude?: number | null;
    longitude?: number | null;
    label?: string; // "Casa", "Trabalho", etc.
}

interface UseGeolocationReturn extends GeolocationState {
    /** Troca a localização para um endereço salvo do usuário */
    setManualLocation: (loc: ManualLocation) => void;
    /** Volta para a localização automática (GPS/Nominatim) */
    clearManualLocation: () => void;
}

const STORAGE_KEY = 'smartcart_geolocation';
const MANUAL_STORAGE_KEY = 'smartcart_manual_location';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

/** Mapa de estados brasileiros → siglas */
const STATE_ABBR: Record<string, string> = {
    'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
    'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF',
    'Espírito Santo': 'ES', 'Goiás': 'GO', 'Maranhão': 'MA',
    'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG',
    'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR', 'Pernambuco': 'PE',
    'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
    'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR',
    'Santa Catarina': 'SC', 'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO',
};

/** Mapa inverso: sigla → nome completo */
const STATE_FULL: Record<string, string> = Object.fromEntries(
    Object.entries(STATE_ABBR).map(([name, abbr]) => [abbr, name])
);

interface CachedGeo {
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    locationString: string;
    displayString: string;
    timestamp: number;
}

/**
 * Hook para obter a geolocalização do usuário e fazer geocodificação reversa
 * (lat/lng → cidade/estado) usando Nominatim (OpenStreetMap, gratuito).
 *
 * Suporta override manual: o usuário pode selecionar um endereço salvo.
 * O resultado é cacheado em localStorage por 24h.
 */
export function useGeolocation(): UseGeolocationReturn {
    const [geo, setGeo] = useState<GeolocationState>({
        latitude: null,
        longitude: null,
        city: null,
        state: null,
        locationString: null,
        displayString: null,
        loading: true,
        error: null,
        isManual: false,
    });

    // ── Manual override ──

    const setManualLocation = useCallback((loc: ManualLocation) => {
        const stateFull = STATE_FULL[loc.state] || loc.state;
        const abbr = loc.state.length === 2 ? loc.state : (STATE_ABBR[loc.state] || loc.state);
        const locationString = `${loc.city}, ${stateFull}, Brazil`;
        const displayString = `${loc.city}, ${abbr}`;

        const manualData = {
            city: loc.city,
            state: loc.state,
            latitude: loc.latitude ?? null,
            longitude: loc.longitude ?? null,
            label: loc.label,
            locationString,
            displayString,
        };
        localStorage.setItem(MANUAL_STORAGE_KEY, JSON.stringify(manualData));

        setGeo({
            latitude: loc.latitude ?? null,
            longitude: loc.longitude ?? null,
            city: loc.city,
            state: abbr,
            locationString,
            displayString,
            loading: false,
            error: null,
            isManual: true,
        });
    }, []);

    const clearManualLocation = useCallback(() => {
        localStorage.removeItem(MANUAL_STORAGE_KEY);
        // Force reload from auto geolocation cache or re-detect
        setGeo(prev => ({ ...prev, loading: true, isManual: false }));
        loadAutoLocation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Auto geolocation ──

    const reverseGeocode = useCallback(async (lat: number, lng: number) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=pt`,
                { headers: { 'User-Agent': 'SmartCart/1.0' } }
            );
            if (!res.ok) throw new Error('Nominatim error');

            const data = await res.json();
            const address = data.address || {};

            const city = address.city || address.town || address.village || address.municipality || null;
            const state = address.state || null;

            if (!city || !state) {
                throw new Error('Não foi possível determinar a cidade/estado');
            }

            const abbr = STATE_ABBR[state] || state;
            const locationString = `${city}, ${state}, Brazil`;
            const displayString = `${city}, ${abbr}`;

            const cached: CachedGeo = {
                latitude: lat,
                longitude: lng,
                city,
                state,
                locationString,
                displayString,
                timestamp: Date.now(),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));

            setGeo({
                latitude: lat,
                longitude: lng,
                city,
                state,
                locationString,
                displayString,
                loading: false,
                error: null,
                isManual: false,
            });
        } catch (err) {
            setGeo(prev => ({
                ...prev,
                latitude: lat,
                longitude: lng,
                loading: false,
                error: err instanceof Error ? err.message : 'Erro na geocodificação reversa',
            }));
        }
    }, []);

    const loadAutoLocation = useCallback(() => {
        // 1. Try cache
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const cached: CachedGeo = JSON.parse(raw);
                if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
                    setGeo({
                        latitude: cached.latitude,
                        longitude: cached.longitude,
                        city: cached.city,
                        state: cached.state,
                        locationString: cached.locationString,
                        displayString: cached.displayString,
                        loading: false,
                        error: null,
                        isManual: false,
                    });
                    return;
                }
            }
        } catch {
            // cache corrupted
        }

        // 2. Browser geolocation
        if (!navigator.geolocation) {
            setGeo(prev => ({
                ...prev,
                loading: false,
                error: 'Geolocalização não suportada pelo navegador',
            }));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                reverseGeocode(pos.coords.latitude, pos.coords.longitude);
            },
            (err) => {
                setGeo(prev => ({
                    ...prev,
                    loading: false,
                    error: err.code === err.PERMISSION_DENIED
                        ? 'Permissão de localização negada'
                        : 'Não foi possível obter a localização',
                }));
            },
            { timeout: 8000, enableHighAccuracy: false, maximumAge: 600000 }
        );
    }, [reverseGeocode]);

    useEffect(() => {
        // Check for manual override first
        try {
            const manual = localStorage.getItem(MANUAL_STORAGE_KEY);
            if (manual) {
                const data = JSON.parse(manual);
                setGeo({
                    latitude: data.latitude ?? null,
                    longitude: data.longitude ?? null,
                    city: data.city,
                    state: data.state,
                    locationString: data.locationString,
                    displayString: data.displayString,
                    loading: false,
                    error: null,
                    isManual: true,
                });
                return;
            }
        } catch {
            // corrupted
        }

        // Fall back to auto-detection
        loadAutoLocation();
    }, [loadAutoLocation]);

    return { ...geo, setManualLocation, clearManualLocation };
}
