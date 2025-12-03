<template>
  <div class="appearance-config">
    <h2>外观设置</h2>
    <p class="description">自定义应用的外观和主题</p>

    <div class="config-section">
      <h3>主题模式</h3>
      <div class="theme-options">
        <div
          v-for="option in themeOptions"
          :key="option.value"
          class="theme-option"
          :class="{ active: appStore.theme === option.value }"
          @click="appStore.setTheme(option.value)"
        >
          <el-icon :size="24"><component :is="option.icon" /></el-icon>
          <span>{{ option.label }}</span>
        </div>
      </div>
    </div>

    <div class="config-section">
      <h3>语言</h3>
      <el-select v-model="appStore.language" size="large" class="w-full">
        <el-option value="zh-CN" label="简体中文" />
        <el-option value="en-US" label="English" />
      </el-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores';
import { Sunny, Moon, Monitor } from '@element-plus/icons-vue';

const appStore = useAppStore();

const themeOptions = [
  { value: 'light' as const, label: '亮色', icon: Sunny },
  { value: 'dark' as const, label: '暗色', icon: Moon },
  { value: 'system' as const, label: '跟随系统', icon: Monitor },
];
</script>

<style lang="scss" scoped>
.appearance-config {
  h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .description {
    color: var(--text-secondary);
    margin-top: 4px;
    margin-bottom: 32px;
  }
}

.config-section {
  margin-bottom: 32px;

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }
}

.theme-options {
  display: flex;
  gap: 12px;

  .theme-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px 32px;
    border: 2px solid var(--border-color);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-secondary);

    &:hover {
      border-color: var(--primary-color);
      color: var(--text-primary);
    }

    &.active {
      border-color: var(--primary-color);
      background: rgba(14, 165, 233, 0.1);
      color: var(--primary-color);
    }

    span {
      font-size: 14px;
    }
  }
}

.w-full {
  width: 100%;
  max-width: 400px;
}
</style>
