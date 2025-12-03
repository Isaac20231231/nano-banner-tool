<template>
  <div class="history-page">
    <div class="page-header">
      <h2>历史记录</h2>
      <p>查看和管理你的生成历史</p>
    </div>
    <div class="coming-soon">
      <el-icon :size="64"><Clock /></el-icon>
      <h3>暂无记录</h3>
      <p>开始生成图片后，历史记录将显示在这里</p>
      <router-link to="/">
        <el-button type="primary">开始生成</el-button>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Clock } from '@element-plus/icons-vue';
</script>

<style lang="scss" scoped>
.history-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 24px;

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
  }

  p {
    color: var(--text-secondary);
    margin-top: 4px;
  }
}

.coming-soon {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--text-secondary);

  h3 {
    margin-top: 16px;
    font-size: 20px;
    color: var(--text-primary);
  }

  p {
    margin: 8px 0 24px;
  }
}
</style>
