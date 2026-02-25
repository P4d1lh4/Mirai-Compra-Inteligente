/** API client for the Mirai backend. */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

// --- Auth helpers ---
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('smartcart_token');
}

export function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// --- Auth types ---
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  zip_code: string | null;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export interface Product {
  id: string;
  name: string;
  brand: string | null;
  ean: string | null;
  description: string | null;
  image_url: string | null;
  unit: string | null;
  category: Category | null;
  min_price: number | null;
  max_price: number | null;
  store_count: number;
}

export interface PriceComparison {
  price: number;
  original_price: number | null;
  is_promotion: boolean;
  promotion_label: string | null;
  is_online: boolean;
  ecommerce_url: string | null;
  store_name: string;
  chain_name: string;
  chain_slug: string;
  chain_logo_url: string | null;
  chain_color_hex: string | null;
  store_address: string;
  store_city: string;
  distance_km: number | null;
  seen_at: string;
}

export interface ProductWithPrices {
  id: string;
  name: string;
  brand: string | null;
  ean: string | null;
  description: string | null;
  image_url: string | null;
  unit: string | null;
  category: Category | null;
  prices: PriceComparison[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface StoreChain {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website_url: string | null;
  has_ecommerce: boolean;
  color_hex: string | null;
}

export interface FlyerItem {
  id: string;
  raw_name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  product_id: string | null;
}

export interface Flyer {
  id: string;
  title: string;
  image_url: string | null;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  chain: StoreChain;
  items: FlyerItem[];
}

export interface ShoppingListItem {
  id: string;
  product_id: string | null;
  custom_name: string | null;
  product_name: string | null;
  product_image_url: string | null;
  quantity: number;
  is_checked: boolean;
  estimated_price: number | null;
  cheapest_store: string | null;
}

export interface ShoppingList {
  id: string;
  name: string;
  notes: string | null;
  items: ShoppingListItem[];
  created_at: string;
  updated_at: string;
}

export interface StoreCostBreakdown {
  chain_name: string;
  chain_slug: string;
  chain_logo_url: string | null;
  store_name: string;
  store_address: string;
  store_city: string;
  distance_km: number | null;
  total_cost: number;
  items_available: number;
  items_missing: number;
}

export interface SerpApiShoppingItem {
  produto: string;
  loja: string;
  preco: number;
  preco_formatado: string;
  link: string;
  imagem: string;
  entrega: string;
  avaliacao: number | null;
  reviews: number;
  posicao: number | null;
}

export interface SerpApiShoppingResponse {
  resultados: SerpApiShoppingItem[];
  total: number;
  busca: string;
  fonte: string;
  cached: boolean;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }
  return res.json();
}

// --- Products ---
export async function searchProducts(
  query: string,
  params?: {
    category?: string;
    brand?: string;
    min_price?: number;
    max_price?: number;
    lat?: number;
    lng?: number;
    page?: number;
    page_size?: number;
  }
): Promise<PaginatedResponse<Product>> {
  const searchParams = new URLSearchParams({ q: query });
  if (params?.category) searchParams.set('category', params.category);
  if (params?.brand) searchParams.set('brand', params.brand);
  if (params?.min_price) searchParams.set('min_price', String(params.min_price));
  if (params?.max_price) searchParams.set('max_price', String(params.max_price));
  if (params?.lat) searchParams.set('lat', String(params.lat));
  if (params?.lng) searchParams.set('lng', String(params.lng));
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.page_size) searchParams.set('page_size', String(params.page_size));

  return apiFetch(`/products/search?${searchParams}`);
}

export async function getProductWithPrices(
  productId: string,
  lat?: number,
  lng?: number
): Promise<ProductWithPrices> {
  const params = new URLSearchParams();
  if (lat) params.set('lat', String(lat));
  if (lng) params.set('lng', String(lng));
  const qs = params.toString() ? `?${params}` : '';
  return apiFetch(`/products/${productId}${qs}`);
}

export async function getCategories(): Promise<Category[]> {
  return apiFetch('/products/categories');
}

// --- Flyers ---
export async function getActiveFlyers(chainSlug?: string): Promise<Flyer[]> {
  const params = chainSlug ? `?chain_slug=${chainSlug}` : '';
  return apiFetch(`/flyers${params}`);
}

// --- Chains ---
export async function getStoreChains(): Promise<StoreChain[]> {
  return apiFetch('/stores/chains');
}

// --- Auth ---
export async function register(data: {
  email: string;
  password: string;
  name: string;
  zip_code?: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function login(data: { email: string; password: string }): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// --- SerpApi (Google Shopping) ---
export async function searchShoppingOffers(
  query: string,
  params?: {
    ordenar_preco?: boolean;
    num?: number;
    preco_min?: number;
    preco_max?: number;
    location?: string;
  }
): Promise<SerpApiShoppingResponse> {
  const searchParams = new URLSearchParams({ q: query });
  if (params?.ordenar_preco !== undefined) {
    searchParams.set('ordenar_preco', String(params.ordenar_preco));
  }
  if (params?.num !== undefined) searchParams.set('num', String(params.num));
  if (params?.preco_min !== undefined) searchParams.set('preco_min', String(params.preco_min));
  if (params?.preco_max !== undefined) searchParams.set('preco_max', String(params.preco_max));
  if (params?.location) searchParams.set('location', params.location);

  return apiFetch(`/serpapi/shopping?${searchParams}`);
}

// --- Profile & Addresses ---

export interface UserAddress {
  id: string;
  label: string;
  street: string;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  zip_code: string;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  zip_code: string | null;
  created_at: string;
  addresses: UserAddress[];
}

export async function getProfile(): Promise<UserProfile> {
  return apiFetch('/profile', { headers: authHeaders() });
}

export async function updateProfile(data: {
  name?: string;
  zip_code?: string | null;
}): Promise<UserProfile> {
  return apiFetch('/profile', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
}

export async function addAddress(data: {
  label: string;
  street: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zip_code: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
}): Promise<UserAddress> {
  return apiFetch('/profile/addresses', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
}

export async function updateAddress(
  addressId: string,
  data: Partial<Omit<UserAddress, 'id' | 'created_at' | 'is_default'>>
): Promise<UserAddress> {
  return apiFetch(`/profile/addresses/${addressId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
}

export async function deleteAddress(addressId: string): Promise<void> {
  await fetch(`${API_BASE}/profile/addresses/${addressId}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
}

export async function setDefaultAddress(addressId: string): Promise<UserAddress> {
  return apiFetch(`/profile/addresses/${addressId}/default`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
}
