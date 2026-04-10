import { useState, useEffect } from 'react';
import { AIKey, AIProvider, getStoredKeys, saveStoredKeys, getPrimaryProvider, setPrimaryProvider } from '@/lib/aiUtils';

export function useAIKeys() {
  const [keys, setKeys] = useState<AIKey[]>([]);
  const [primaryProvider, setPrimaryProviderState] = useState<AIProvider>('gemini');

  useEffect(() => {
    refreshKeys();
    setPrimaryProviderState(getPrimaryProvider());
  }, []);

  const refreshKeys = () => {
    const rawKeys = getStoredKeys();
    // Chuyển đổi định dạng cũ nếu có
    const mappedKeys = rawKeys.map((k: any) => ({
      ...k,
      provider: k.provider || 'gemini' // Mặc định về gemini nếu key cũ không có field này
    }));
    setKeys(mappedKeys);
    if(JSON.stringify(rawKeys) !== JSON.stringify(mappedKeys)) {
      saveStoredKeys(mappedKeys);
    }
  };

  const changePrimaryProvider = (provider: AIProvider) => {
    setPrimaryProvider(provider);
    setPrimaryProviderState(provider);
  };

  const addKeysBulk = (provider: AIProvider, keysString: string) => {
    const lines = keysString.split('\n').map(l => l.trim()).filter(l => l.length > 5);
    if (lines.length === 0) return 0;
    
    const currentKeys = getStoredKeys();
    const newKeys: AIKey[] = lines.map(line => ({
      id: Math.random().toString(36).substring(7),
      provider,
      key: line,
      isActive: true,
      isInvalid: false
    }));
    
    saveStoredKeys([...currentKeys, ...newKeys]);
    refreshKeys();
    return newKeys.length;
  };

  const removeKey = (id: string) => {
    const currentKeys = getStoredKeys();
    saveStoredKeys(currentKeys.filter(k => k.id !== id));
    refreshKeys();
  };

  const toggleKeyActivity = (id: string) => {
    const currentKeys = getStoredKeys();
    saveStoredKeys(currentKeys.map(k => k.id === id ? { ...k, isActive: !k.isActive } : k));
    refreshKeys();
  };
  
  return {
    keys,
    primaryProvider,
    changePrimaryProvider,
    addKeysBulk,
    removeKey,
    toggleKeyActivity,
    refreshKeys
  };
}
