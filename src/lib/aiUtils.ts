export type AIProvider = 'gemini' | 'deepseek';

export interface AIKey {
  id: string;
  provider: AIProvider;
  key: string;
  isActive: boolean;
  isInvalid?: boolean;
}

const STORAGE_KEY = 'dta_ai_keys';
const PROVIDER_KEY = 'dta_ai_primary_provider';

export const getStoredKeys = (): AIKey[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveStoredKeys = (keys: AIKey[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
};

export const getPrimaryProvider = (): AIProvider => {
  return (localStorage.getItem(PROVIDER_KEY) as AIProvider) || 'gemini';
};

export const setPrimaryProvider = (provider: AIProvider) => {
  localStorage.setItem(PROVIDER_KEY, provider);
};

/**
 * Lấy 1 Key sống ngẫu nhiên từ localStorage (đọc trực tiếp, không qua React state).
 * Chỉ lấy key có isActive=true VÀ isInvalid KHÔNG phải true.
 */
export const getFreshAvailableKey = (provider: AIProvider): AIKey | null => {
  const keys = getStoredKeys();
  const activeKeys = keys.filter(k => k.provider === provider && k.isActive && !k.isInvalid);
  if (activeKeys.length === 0) return null;
  // Round-robin đơn giản bằng random
  const randomIndex = Math.floor(Math.random() * activeKeys.length);
  return activeKeys[randomIndex];
};

/**
 * Đánh dấu 1 key là hỏng (isInvalid = true) trong localStorage.
 * Chỉ được gọi khi API trả về 401/403/429 (xác thực thất bại hoặc hết quota).
 */
export const markKeyInvalidSync = (keyString: string) => {
  const keys = getStoredKeys();
  const updated = keys.map(k => k.key === keyString ? { ...k, isInvalid: true } : k);
  saveStoredKeys(updated);
};

/**
 * ĐẶT LẠI trạng thái 1 key về "sống" (isInvalid = false).
 * Được gọi khi Test Key thành công.
 */
export const markKeyValidSync = (keyString: string) => {
  const keys = getStoredKeys();
  const updated = keys.map(k => k.key === keyString ? { ...k, isInvalid: false } : k);
  saveStoredKeys(updated);
};

/**
 * RESET toàn bộ key của 1 provider về trạng thái sống (isInvalid = false).
 * Dùng khi người dùng muốn thử lại toàn bộ key.
 */
export const resetAllKeysValidity = (provider: AIProvider) => {
  const keys = getStoredKeys();
  const updated = keys.map(k => k.provider === provider ? { ...k, isInvalid: false } : k);
  saveStoredKeys(updated);
};

/**
 * Hàm Retry thông minh: Tự động lấy Key sống, gọi API.
 * Nếu gặp lỗi xác thực (401/403) hoặc quá tải (429), tự chuyển sang Key tiếp theo.
 * KHÔNG đánh dấu Key hỏng khi gặp lỗi nội dung (400) hoặc lỗi mạng.
 */
export const fetchWithAIRetry = async (
  provider: AIProvider,
  fetchFn: (apiKey: string, fallbackModel?: string) => Promise<Response>,
  maxRetries: number = 3
): Promise<Response> => {
  let attempt = 0;
  let lastError: Error | null = null;
  // Danh sách model dự phòng cho Gemini (Tự động lùi về bản nhẹ hơn nếu bản chính bị 503)
  const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-flash'];

  while (attempt < maxRetries) {
    const keyObj = getFreshAvailableKey(provider);
    if (!keyObj) {
      // Thử reset toàn bộ key và lấy lại 1 lần nữa trước khi bỏ cuộc
      resetAllKeysValidity(provider);
      const retryKey = getFreshAvailableKey(provider);
      if (!retryKey) {
        throw new Error(`NO_API_KEY_${provider.toUpperCase()}`);
      }
      // Dùng key vừa phục hồi
      try {
        const fallModel = provider === 'gemini' ? GEMINI_MODELS[attempt % GEMINI_MODELS.length] : undefined;
        const response = await fetchFn(retryKey.key, fallModel);
        if (response.ok) return response;
        // Nếu vẫn lỗi xác thực thì key thật sự chết
        if (response.status === 429 || response.status === 403 || response.status === 401) {
          markKeyInvalidSync(retryKey.key);
        }
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(`API Error ${response.status}: ${errorBody.error?.message || response.statusText}`);
      } catch (e: any) {
        throw e;
      }
    }

    try {
      const fallbackModel = provider === 'gemini' ? GEMINI_MODELS[attempt % GEMINI_MODELS.length] : undefined;
      const response = await fetchFn(keyObj.key, fallbackModel);

      // Nếu máy chủ quá tải (503) hoặc lỗi nội bộ (500) -> Thử model dự phòng (Lite / 1.5)
      if (response.status === 503 || response.status === 500) {
        attempt++;
        console.warn(`[AI System] Máy chủ AI quá tải (${response.status}). Thử lại với model ${GEMINI_MODELS[attempt % GEMINI_MODELS.length]}... (${attempt}/${maxRetries})`);
        // Lỗi này thiên về sever, ta không invalid key để tránh chết oan key API
        continue;
      }

      // Nếu 429 quá tải token, hoặc 403/401 hỏng key → Đánh dấu chết và thử key khác
      if (response.status === 429 || response.status === 403 || response.status === 401) {
        markKeyInvalidSync(keyObj.key);
        attempt++;
        console.warn(`[AI System] Key ${keyObj.key.substring(0, 8)}... lỗi ${response.status}. Chuyển key (${attempt}/${maxRetries})...`);
        continue;
      }

      if (!response.ok) {
        // Lỗi 400 (payload sai) → KHÔNG phải lỗi Key, ném thẳng cho caller xử lý
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(`API Error ${response.status}: ${errorBody.error?.message || response.statusText}`);
      }

      // Thành công! return response
      return response;

    } catch (error: any) {
      if (error.name === 'AbortError') throw error;
      if (error.message?.includes('NO_API_KEY')) throw error;

      lastError = error;
      attempt++;
      console.warn(`[AI System] Lần thử ${attempt}/${maxRetries} thất bại:`, error.message);
      if (attempt >= maxRetries) throw error;
    }
  }

  throw lastError || new Error(`EXHAUSTED_ALL_KEYS_${provider.toUpperCase()}`);
};
