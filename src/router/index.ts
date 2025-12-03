import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home/index.vue'),
    meta: { title: '首页', icon: 'HomeFilled' },
  },
  {
    path: '/text-to-image',
    name: 'TextToImage',
    component: () => import('@/views/TextToImage/index.vue'),
    meta: { title: '文生图', icon: 'EditPen' },
  },
  {
    path: '/image-to-image',
    name: 'ImageToImage',
    component: () => import('@/views/ImageToImage/index.vue'),
    meta: { title: '图生图', icon: 'PictureFilled' },
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/History/index.vue'),
    meta: { title: '历史记录', icon: 'Clock' },
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: () => import('@/views/Gallery/index.vue'),
    meta: { title: '素材库', icon: 'FolderOpened' },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings/index.vue'),
    meta: { title: '设置', icon: 'Setting' },
    children: [
      {
        path: '',
        redirect: '/settings/api',
      },
      {
        path: 'api',
        name: 'SettingsApi',
        component: () => import('@/views/Settings/ApiConfig.vue'),
        meta: { title: 'API 配置' },
      },
      {
        path: 'model',
        name: 'SettingsModel',
        component: () => import('@/views/Settings/ModelConfig.vue'),
        meta: { title: '模型配置' },
      },
      {
        path: 'appearance',
        name: 'SettingsAppearance',
        component: () => import('@/views/Settings/AppearanceConfig.vue'),
        meta: { title: '外观设置' },
      },
      {
        path: 'about',
        name: 'SettingsAbout',
        component: () => import('@/views/Settings/AboutPage.vue'),
        meta: { title: '关于' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  const title = to.meta.title as string;
  document.title = title ? `${title} - Nano Banner Tool` : 'Nano Banner Tool';
  next();
});

export default router;
