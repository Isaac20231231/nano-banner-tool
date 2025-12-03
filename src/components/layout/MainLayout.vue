<template>
  <div class="main-layout" :class="{ 'sidebar-collapsed': appStore.sidebarCollapsed }">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <img src="@/assets/logo.svg" alt="Logo" class="logo-icon" />
          <span v-if="!appStore.sidebarCollapsed" class="logo-text">Nano Banner</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <el-icon :size="20">
            <component :is="item.icon" />
          </el-icon>
          <span v-if="!appStore.sidebarCollapsed" class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button class="collapse-btn" @click="appStore.toggleSidebar">
          <el-icon :size="18">
            <Fold v-if="!appStore.sidebarCollapsed" />
            <Expand v-else />
          </el-icon>
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 顶部栏 -->
      <header class="top-bar">
        <div class="page-title">
          <h1>{{ currentPageTitle }}</h1>
        </div>

        <div class="top-bar-actions">
          <!-- API 状态 -->
          <div class="api-status" :class="{ connected: apiStore.isConnected }">
            <el-icon :size="16">
              <Connection v-if="apiStore.isConnected" />
              <WarningFilled v-else />
            </el-icon>
            <span>{{ apiStore.isConnected ? 'API 已连接' : 'API 未配置' }}</span>
          </div>

          <!-- 主题切换 -->
          <el-tooltip :content="appStore.isDark ? '切换到亮色模式' : '切换到暗色模式'">
            <button class="theme-toggle" @click="toggleTheme">
              <el-icon :size="18">
                <Sunny v-if="appStore.isDark" />
                <Moon v-else />
              </el-icon>
            </button>
          </el-tooltip>

          <!-- 设置按钮 -->
          <el-tooltip content="设置">
            <router-link to="/settings" class="settings-btn">
              <el-icon :size="18">
                <Setting />
              </el-icon>
            </router-link>
          </el-tooltip>
        </div>
      </header>

      <!-- 页面内容 -->
      <div class="page-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>

      <!-- 底部状态栏 -->
      <footer class="status-bar">
        <div class="status-left">
          <span class="status-item">
            <el-icon :size="14"><Cpu /></el-icon>
            {{ apiStore.activeProvider.toUpperCase() }}
          </span>
          <span v-if="generationStore.isGenerating" class="status-item generating">
            <el-icon class="is-loading" :size="14"><Loading /></el-icon>
            生成中 {{ generationStore.progress }}%
          </span>
        </div>
        <div class="status-right">
          <span v-if="apiStore.balance !== null" class="status-item">
            余额: ${{ apiStore.balance.toFixed(2) }}
          </span>
          <span class="status-item">v0.1.0</span>
        </div>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore, useApiStore, useGenerationStore } from '@/stores';
import {
  HomeFilled,
  EditPen,
  PictureFilled,
  Clock,
  FolderOpened,
  Setting,
  Fold,
  Expand,
  Connection,
  WarningFilled,
  Sunny,
  Moon,
  Cpu,
  Loading,
} from '@element-plus/icons-vue';

const route = useRoute();
const appStore = useAppStore();
const apiStore = useApiStore();
const generationStore = useGenerationStore();

const menuItems = [
  { path: '/', label: '首页', icon: HomeFilled },
  { path: '/text-to-image', label: '文生图', icon: EditPen },
  { path: '/image-to-image', label: '图生图', icon: PictureFilled },
  { path: '/history', label: '历史记录', icon: Clock },
  { path: '/gallery', label: '素材库', icon: FolderOpened },
];

const currentPageTitle = computed(() => {
  return (route.meta.title as string) || 'Nano Banner Tool';
});

function isActive(path: string): boolean {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(path);
}

function toggleTheme() {
  appStore.setTheme(appStore.isDark ? 'light' : 'dark');
}
</script>

<style lang="scss" scoped>
.main-layout {
  display: flex;
  height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);

  --sidebar-width: 220px;
  --sidebar-collapsed-width: 64px;
  --top-bar-height: 56px;
  --status-bar-height: 28px;

  &.sidebar-collapsed {
    .sidebar {
      width: var(--sidebar-collapsed-width);
    }

    .main-content {
      margin-left: var(--sidebar-collapsed-width);
    }
  }
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  z-index: 100;

  .sidebar-header {
    height: var(--top-bar-height);
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid var(--border-color);

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;

      .logo-icon {
        width: 32px;
        height: 32px;
      }

      .logo-text {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
        white-space: nowrap;
      }
    }
  }

  .sidebar-nav {
    flex: 1;
    padding: 12px 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
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

      .nav-label {
        font-size: 14px;
        white-space: nowrap;
      }
    }
  }

  .sidebar-footer {
    padding: 12px;
    border-top: 1px solid var(--border-color);

    .collapse-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s;

      &:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
      }
    }
  }
}

.main-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
}

.top-bar {
  height: var(--top-bar-height);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;

  .page-title h1 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .top-bar-actions {
    display: flex;
    align-items: center;
    gap: 16px;

    .api-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--text-secondary);
      padding: 6px 12px;
      background: var(--bg-tertiary);
      border-radius: 6px;

      &.connected {
        color: #10b981;
      }
    }

    .theme-toggle,
    .settings-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s;
      text-decoration: none;

      &:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
      }
    }
  }
}

.page-content {
  flex: 1;
  overflow: auto;
  padding: 24px;
}

.status-bar {
  height: var(--status-bar-height);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-size: 12px;
  color: var(--text-secondary);

  .status-left,
  .status-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 4px;

    &.generating {
      color: var(--primary-color);
    }
  }
}

// 页面切换动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
