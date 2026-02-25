'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, AuthResponse } from '@/lib/api';

interface User {
    id: string;
    email: string;
    name: string;
    zip_code: string | null;
    created_at: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, zip_code?: string) => Promise<void>;
    logout: () => void;
    updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_TOKEN = 'smartcart_token';
const STORAGE_KEY_USER = 'smartcart_user';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Rehydrate from localStorage on mount
    useEffect(() => {
        try {
            const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
            const savedUser = localStorage.getItem(STORAGE_KEY_USER);
            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            }
        } catch {
            // corrupted storage — ignore
        } finally {
            setIsLoading(false);
        }
    }, []);

    const persistAuth = useCallback((data: AuthResponse) => {
        setToken(data.access_token);
        setUser(data.user);
        localStorage.setItem(STORAGE_KEY_TOKEN, data.access_token);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const data = await apiLogin({ email, password });
        persistAuth(data);
    }, [persistAuth]);

    const register = useCallback(async (name: string, email: string, password: string, zip_code?: string) => {
        const data = await apiRegister({ email, password, name, zip_code });
        persistAuth(data);
    }, [persistAuth]);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        localStorage.removeItem(STORAGE_KEY_USER);
    }, []);

    const updateUser = useCallback((updatedUser: Partial<User>) => {
        setUser(prev => {
            if (!prev) return prev;
            const merged = { ...prev, ...updatedUser };
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(merged));
            return merged;
        });
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

