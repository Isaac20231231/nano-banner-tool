import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ApiConfig, ApiProvider } from '@/types';

export const useApiStore = defineStore('api', () => {
  // API 配置列表
  const configs = ref<Record<ApiProvider, ApiConfig>>({
    fal: {
      provider: 'fal',
      apiKey: '',
      baseUrl: 'https://fal.run',
      timeout: 120000,
    },
    google: {
      provider: 'google',
      apiKey: '',
      baseUrl: 'https://generativelanguage.googleapis.com',
      timeout: 120000,
    },
    custom: {
      provider: 'custom',
      apiKey: '',
      baseUrl: '',
      timeout: 120000,
    },
  });

  // 当前活跃的提供商
  const activeProvider = ref<ApiProvider>('fal');

  // 连接状态
  const isConnected = ref(false);
  const lastError = ref<string | null>(null);

  // 费用统计
  const totalSpent = ref(0);
  const balance = ref<number | null>(null);

  // 计算属性
  const currentConfig = computed(() => {
    return configs.value[activeProvider.value];
  });

  const hasApiKey = computed(() => {
    return currentConfig.value.apiKey.length > 0;
  });

  // 方法
  function setActiveProvider(provider: ApiProvider) {
    activeProvider.value = provider;
  }

  function updateConfig(provider: ApiProvider, config: Partial<ApiConfig>) {
    configs.value[provider] = {
      ...configs.value[provider],
      ...config,
    };
  }

  function setApiKey(provider: ApiProvider, apiKey: string) {
    configs.value[provider].apiKey = apiKey;
  }

  function setProxy(provider: ApiProvider, proxy: string) {
    configs.value[provider].proxy = proxy;
  }

  function setConnected(status: boolean) {
    isConnected.value = status;
  }

  function setError(error: string | null) {
    lastError.value = error;
  }

  function addSpent(amount: number) {
    totalSpent.value += amount;
  }

  function setBalance(newBalance: number | null) {
    balance.value = newBalance;
  }

  function getConfigByProvider(provider: ApiProvider): ApiConfig {
    return configs.value[provider];
  }

  // 保存配置到本地存储
  function saveConfigs() {
    // TODO: 使用 Tauri 的加密存储
    localStorage.setItem('api_configs', JSON.stringify(configs.value));
    localStorage.setItem('active_provider', activeProvider.value);
    // 保存连接状态
    localStorage.setItem('api_connected', isConnected.value ? 'true' : 'false');
  }

  // 从本地存储加载配置
  function loadConfigs() {
    const savedConfigs = localStorage.getItem('api_configs');
    const savedProvider = localStorage.getItem('active_provider');
    const savedConnected = localStorage.getItem('api_connected');

    // 先加载 provider，再加载 configs
    if (savedProvider && ['fal', 'google', 'custom'].includes(savedProvider)) {
      activeProvider.value = savedProvider as ApiProvider;
    }

    if (savedConfigs) {
      try {
        const parsed = JSON.parse(savedConfigs);
        configs.value = { ...configs.value, ...parsed };
      } catch {
        console.error('Failed to parse saved API configs');
      }
    }

    // 检查当前 provider 的 API Key 是否存在
    const currentApiKey = configs.value[activeProvider.value]?.apiKey;
    const hasKey = currentApiKey && currentApiKey.length > 0;

    // 如果有保存的连接状态且有 API Key，恢复连接状态
    if (savedConnected === 'true' && hasKey) {
      isConnected.value = true;
    }

    console.log('Loaded configs:', {
      provider: activeProvider.value,
      hasApiKey: hasKey,
      isConnected: isConnected.value,
    });
  }

  return {
    configs,
    activeProvider,
    isConnected,
    lastError,
    totalSpent,
    balance,
    currentConfig,
    hasApiKey,
    setActiveProvider,
    updateConfig,
    setApiKey,
    setProxy,
    setConnected,
    setError,
    addSpent,
    setBalance,
    getConfigByProvider,
    saveConfigs,
    loadConfigs,
  };
});
