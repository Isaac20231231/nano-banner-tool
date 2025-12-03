import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AppSettings } from '@/types';

export const useAppStore = defineStore('app', () => {
  // 状态
  const theme = ref<'light' | 'dark' | 'system'>('dark');
  const language = ref<'zh-CN' | 'en-US'>('zh-CN');
  const sidebarCollapsed = ref(false);
  const loading = ref(false);

  const settings = ref<AppSettings>({
    theme: 'dark',
    language: 'zh-CN',
    saveDirectory: '',
    autoSave: true,
    defaultModel: 'nano-banana-pro',
    defaultResolution: '1K',
    defaultAspectRatio: '1:1',
  });

  // 计算属性
  const isDark = computed(() => {
    if (theme.value === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme.value === 'dark';
  });

  // 方法
  function setTheme(newTheme: 'light' | 'dark' | 'system') {
    theme.value = newTheme;
    settings.value.theme = newTheme;
    applyTheme();
  }

  function applyTheme() {
    if (isDark.value) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function setLoading(state: boolean) {
    loading.value = state;
  }

  function updateSettings(newSettings: Partial<AppSettings>) {
    settings.value = { ...settings.value, ...newSettings };
  }

  // 初始化
  function init() {
    applyTheme();
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'system') {
        applyTheme();
      }
    });
  }

  return {
    theme,
    language,
    sidebarCollapsed,
    loading,
    settings,
    isDark,
    setTheme,
    toggleSidebar,
    setLoading,
    updateSettings,
    init,
  };
});
