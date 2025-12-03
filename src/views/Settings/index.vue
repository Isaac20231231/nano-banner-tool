<template>
  <div class="settings-page">
    <div class="settings-container">
      <!-- 左侧菜单 -->
      <div class="settings-menu">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="menu-item"
          :class="{ active: isActive(item.path) }"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </router-link>
      </div>

      <!-- 右侧内容 -->
      <div class="settings-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { Key, Cpu, Brush, InfoFilled } from '@element-plus/icons-vue';

const route = useRoute();

const menuItems = [
  { path: '/settings/api', label: 'API 配置', icon: Key },
  { path: '/settings/model', label: '模型配置', icon: Cpu },
  { path: '/settings/appearance', label: '外观设置', icon: Brush },
  { path: '/settings/about', label: '关于', icon: InfoFilled },
];

function isActive(path: string): boolean {
  return route.path === path;
}
</script>

<style lang="scss" scoped>
.settings-page {
  height: 100%;
}

.settings-container {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 24px;
  height: 100%;
}

.settings-menu {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    color: var(--text-secondary);
    text-decoration: none;
    transition: all 0.2s;

    &:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }

    &.active {
      background: var(--primary-color);
      color: white;
    }
  }
}

.settings-content {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  overflow-y: auto;
}
</style>
