<template>
  <div class="model-config">
    <h2>模型配置</h2>
    <p class="description">设置默认的生成模型和参数</p>

    <div class="config-section">
      <h3>默认模型</h3>
      <el-select v-model="appStore.settings.defaultModel" size="large" class="w-full">
        <el-option value="nano-banana" label="Nano Banana (Gemini 2.5 Flash)" />
        <el-option value="nano-banana-pro" label="Nano Banana Pro (Gemini 3 Pro)" />
      </el-select>
      <p class="help-text">
        Nano Banana Pro 生成质量更高，但速度较慢且费用更高
      </p>
    </div>

    <div class="config-section">
      <h3>默认分辨率</h3>
      <el-select v-model="appStore.settings.defaultResolution" size="large" class="w-full">
        <el-option value="1K" label="1K (标准)" />
        <el-option value="2K" label="2K (高清)" />
        <el-option value="4K" label="4K (超清)" />
      </el-select>
      <p class="help-text">
        4K 分辨率费用为标准的 2 倍
      </p>
    </div>

    <div class="config-section">
      <h3>默认宽高比</h3>
      <el-select v-model="appStore.settings.defaultAspectRatio" size="large" class="w-full">
        <el-option value="1:1" label="1:1 (正方形)" />
        <el-option value="16:9" label="16:9 (横屏)" />
        <el-option value="9:16" label="9:16 (竖屏)" />
        <el-option value="4:3" label="4:3" />
        <el-option value="3:4" label="3:4" />
      </el-select>
    </div>

    <div class="config-section">
      <h3>自动保存</h3>
      <el-switch v-model="appStore.settings.autoSave" />
      <p class="help-text">
        开启后，生成的图片将自动保存到本地
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores';

const appStore = useAppStore();
</script>

<style lang="scss" scoped>
.model-config {
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

  .help-text {
    font-size: 13px;
    color: var(--text-secondary);
    margin-top: 8px;
  }
}

.w-full {
  width: 100%;
  max-width: 400px;
}
</style>
