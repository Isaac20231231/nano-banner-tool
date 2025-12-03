<template>
  <div class="api-config">
    <h2>API 配置</h2>
    <p class="description">配置 AI 图像生成 API 密钥</p>

    <!-- API 提供商选择 -->
    <div class="config-section">
      <h3>API 提供商</h3>
      <el-radio-group v-model="apiStore.activeProvider" class="provider-group">
        <el-radio-button value="fal">
          <div class="provider-option">
            <strong>fal.ai</strong>
            <span>推荐，简单易用</span>
          </div>
        </el-radio-button>
        <el-radio-button value="google">
          <div class="provider-option">
            <strong>Google AI</strong>
            <span>直连 Gemini API</span>
          </div>
        </el-radio-button>
        <el-radio-button value="custom">
          <div class="provider-option">
            <strong>自定义</strong>
            <span>其他代理服务</span>
          </div>
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- API Key 配置 -->
    <div class="config-section">
      <h3>API Key</h3>
      <el-input
        v-model="currentApiKey"
        type="password"
        placeholder="输入你的 API Key"
        show-password
        size="large"
      >
        <template #prefix>
          <el-icon><Key /></el-icon>
        </template>
      </el-input>
      <p class="help-text">
        <template v-if="apiStore.activeProvider === 'fal'">
          前往 <a href="https://fal.ai/dashboard/keys" target="_blank">fal.ai</a> 获取 API Key
        </template>
        <template v-else-if="apiStore.activeProvider === 'google'">
          前往 <a href="https://aistudio.google.com/apikey" target="_blank">Google AI Studio</a> 获取 API Key
        </template>
        <template v-else>
          请输入自定义 API 服务的密钥
        </template>
      </p>
    </div>

    <!-- 自定义 Base URL -->
    <div v-if="apiStore.activeProvider === 'custom'" class="config-section">
      <h3>API Base URL</h3>
      <el-input
        v-model="currentBaseUrl"
        placeholder="https://api.example.com"
        size="large"
      >
        <template #prefix>
          <el-icon><Link /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 代理设置 -->
    <div class="config-section">
      <h3>网络代理 <span class="optional">(可选)</span></h3>
      <el-input
        v-model="currentProxy"
        placeholder="http://127.0.0.1:7890"
        size="large"
      >
        <template #prefix>
          <el-icon><Connection /></el-icon>
        </template>
      </el-input>
      <p class="help-text">如果你需要通过代理访问 API，请配置代理地址</p>
    </div>

    <!-- 测试连接 -->
    <div class="config-section">
      <div class="action-row">
        <el-button type="primary" :loading="testing" @click="testConnection">
          测试连接
        </el-button>
        <el-button @click="saveConfig">保存配置</el-button>
      </div>

      <div v-if="testResult" class="test-result" :class="testResult.success ? 'success' : 'error'">
        <el-icon>
          <CircleCheckFilled v-if="testResult.success" />
          <CircleCloseFilled v-else />
        </el-icon>
        <span>{{ testResult.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useApiStore } from '@/stores';
import { createApiService } from '@/services/api';
import { ElMessage } from 'element-plus';
import {
  Key,
  Link,
  Connection,
  CircleCheckFilled,
  CircleCloseFilled,
} from '@element-plus/icons-vue';

const apiStore = useApiStore();

const testing = ref(false);
const testResult = ref<{ success: boolean; message: string } | null>(null);

const currentApiKey = computed({
  get: () => apiStore.currentConfig.apiKey,
  set: (value) => apiStore.setApiKey(apiStore.activeProvider, value),
});

const currentBaseUrl = computed({
  get: () => apiStore.currentConfig.baseUrl || '',
  set: (value) => apiStore.updateConfig(apiStore.activeProvider, { baseUrl: value }),
});

const currentProxy = computed({
  get: () => apiStore.currentConfig.proxy || '',
  set: (value) => apiStore.setProxy(apiStore.activeProvider, value),
});

async function testConnection() {
  if (!currentApiKey.value) {
    testResult.value = { success: false, message: '请先输入 API Key' };
    return;
  }

  testing.value = true;
  testResult.value = null;

  try {
    // 创建 API 服务并测试连接
    const apiService = createApiService(
      apiStore.activeProvider,
      apiStore.currentConfig
    );

    await apiService.testConnection();

    testResult.value = { success: true, message: '连接成功！API 配置有效' };
    apiStore.setConnected(true);
    // 测试成功后自动保存配置
    apiStore.saveConfigs();
    ElMessage.success('API 连接成功，配置已保存');
  } catch (error) {
    const message = error instanceof Error ? error.message : '连接失败，请检查配置';
    testResult.value = { success: false, message };
    apiStore.setConnected(false);
  } finally {
    testing.value = false;
  }
}

function saveConfig() {
  apiStore.saveConfigs();
  ElMessage.success('配置已保存');
}
</script>

<style lang="scss" scoped>
.api-config {
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

    .optional {
      font-weight: 400;
      color: var(--text-secondary);
    }
  }

  .help-text {
    font-size: 13px;
    color: var(--text-secondary);
    margin-top: 8px;

    a {
      color: var(--primary-color);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.provider-group {
  display: flex;
  gap: 12px;

  :deep(.el-radio-button__inner) {
    padding: 16px 24px;
    height: auto;
  }

  .provider-option {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;

    strong {
      font-size: 14px;
    }

    span {
      font-size: 12px;
      opacity: 0.8;
    }
  }
}

.action-row {
  display: flex;
  gap: 12px;
}

.test-result {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;

  &.success {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }

  &.error {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }
}
</style>
