<template>
  <div class="text-to-image-page">
    <div class="page-container">
      <!-- 左侧控制面板 -->
      <div class="control-panel">
        <div class="panel-header">
          <h2>文生图 - 专业模式</h2>
          <p>更多参数控制，适合专业用户</p>
        </div>

        <!-- 提示词输入 -->
        <div class="panel-section">
          <h3 class="section-title">
            <el-icon><EditPen /></el-icon>
            提示词
          </h3>
          <el-input
            v-model="prompt"
            type="textarea"
            :rows="5"
            placeholder="详细描述你想要生成的图像..."
            :maxlength="4000"
            show-word-limit
            resize="none"
          />
        </div>

        <!-- 负面提示词 -->
        <div class="panel-section">
          <h3 class="section-title">
            <el-icon><Remove /></el-icon>
            负面提示词
          </h3>
          <el-input
            v-model="negativePrompt"
            type="textarea"
            :rows="3"
            placeholder="不希望出现的内容，如：模糊、低质量、变形..."
            resize="none"
          />
        </div>

        <!-- 模型选择 -->
        <div class="panel-section">
          <h3 class="section-title">
            <el-icon><Cpu /></el-icon>
            模型
          </h3>
          <el-select v-model="model" class="w-full">
            <el-option value="nano-banana" label="Gemini 2.0 Flash (快速)" />
            <el-option value="nano-banana-pro" label="Gemini 3 Pro Image (高质量)" />
          </el-select>
        </div>

        <!-- 图像尺寸 -->
        <div class="panel-section">
          <h3 class="section-title">
            <el-icon><FullScreen /></el-icon>
            图像尺寸
          </h3>
          <div class="size-grid">
            <div class="size-item">
              <label>宽高比</label>
              <el-select v-model="aspectRatio">
                <el-option value="1:1" label="1:1 正方形" />
                <el-option value="16:9" label="16:9 横屏" />
                <el-option value="9:16" label="9:16 竖屏" />
                <el-option value="4:3" label="4:3" />
                <el-option value="3:4" label="3:4" />
                <el-option value="3:2" label="3:2" />
                <el-option value="2:3" label="2:3" />
                <el-option value="21:9" label="21:9 超宽" />
              </el-select>
            </div>
            <div class="size-item">
              <label>分辨率</label>
              <el-select v-model="resolution">
                <el-option value="1K" label="1K 标准" />
                <el-option value="2K" label="2K 高清" />
                <el-option value="4K" label="4K 超清" />
              </el-select>
            </div>
          </div>
        </div>

        <!-- 高级参数 -->
        <div class="panel-section">
          <h3 class="section-title">
            <el-icon><Setting /></el-icon>
            高级参数
          </h3>

          <div class="param-group">
            <div class="param-row">
              <label>生成数量</label>
              <el-input-number v-model="numImages" :min="1" :max="4" size="small" />
            </div>

            <div class="param-row">
              <label>
                随机种子
                <el-tooltip content="相同种子生成相似图像，留空为随机">
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </label>
              <el-input
                v-model="seedInput"
                placeholder="留空随机"
                size="small"
                style="width: 120px"
                @input="handleSeedInput"
              />
              <el-button size="small" @click="generateRandomSeed">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>

            <div class="param-row">
              <label>输出格式</label>
              <el-radio-group v-model="outputFormat" size="small">
                <el-radio-button value="png">PNG</el-radio-button>
                <el-radio-button value="jpeg">JPEG</el-radio-button>
                <el-radio-button value="webp">WebP</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </div>

        <!-- 生成按钮 -->
        <div class="generate-section">
          <el-button
            type="primary"
            size="large"
            :loading="isGenerating"
            :disabled="!canGenerate"
            class="generate-btn"
            @click="handleGenerate"
          >
            <el-icon v-if="!isGenerating"><MagicStick /></el-icon>
            {{ isGenerating ? `生成中 ${progress}%` : '开始生成' }}
          </el-button>

          <div v-if="!apiStore.hasApiKey" class="api-warning">
            <el-icon><WarningFilled /></el-icon>
            <span>请先配置 API Key</span>
            <router-link to="/settings/api">去配置</router-link>
          </div>
        </div>
      </div>

      <!-- 右侧预览区 -->
      <div class="preview-panel">
        <div class="preview-header">
          <h3>生成结果</h3>
          <div v-if="generatedImages.length > 0" class="preview-actions">
            <el-button size="small" @click="downloadAll">
              <el-icon><Download /></el-icon>
              下载全部
            </el-button>
            <el-button size="small" @click="clearResults">
              <el-icon><Delete /></el-icon>
              清空
            </el-button>
          </div>
        </div>

        <div class="preview-content">
          <!-- 生成中状态 -->
          <div v-if="isGenerating" class="generating-state">
            <div class="generating-animation">
              <el-icon class="is-loading" :size="48"><Loading /></el-icon>
            </div>
            <p>AI 正在创作中...</p>
            <el-progress :percentage="progress" :stroke-width="8" :show-text="false" />
          </div>

          <!-- 生成结果 -->
          <div v-else-if="generatedImages.length > 0" class="result-grid">
            <div
              v-for="image in generatedImages"
              :key="image.id"
              class="result-item"
              @click="viewImage(image)"
            >
              <img :src="image.url" :alt="image.fileName" />
              <div class="result-overlay">
                <el-button circle size="small" @click.stop="downloadImage(image)">
                  <el-icon><Download /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <el-icon :size="64"><PictureFilled /></el-icon>
            <p>输入提示词并点击生成</p>
            <p class="sub-text">专业模式提供更多参数控制</p>
          </div>

          <!-- 错误状态 -->
          <div v-if="error" class="error-state">
            <el-icon :size="32"><CircleCloseFilled /></el-icon>
            <p>{{ error }}</p>
            <el-button size="small" @click="clearResults">重试</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useApiStore } from '@/stores';
import { createApiService } from '@/services/api';
import type { GeneratedImage, AspectRatio, Resolution, OutputFormat, ModelType } from '@/types';
import { ElMessage } from 'element-plus';
import {
  EditPen,
  Remove,
  Cpu,
  FullScreen,
  Setting,
  QuestionFilled,
  Refresh,
  MagicStick,
  WarningFilled,
  Download,
  Delete,
  Loading,
  PictureFilled,
  CircleCloseFilled,
} from '@element-plus/icons-vue';

const apiStore = useApiStore();

// 表单状态
const prompt = ref('');
const negativePrompt = ref('');
const model = ref<ModelType>('nano-banana-pro');
const aspectRatio = ref<AspectRatio>('1:1');
const resolution = ref<Resolution>('1K');
const numImages = ref(1);
const seedInput = ref('');
const seed = ref<number | undefined>(undefined);
const outputFormat = ref<OutputFormat>('png');

// 生成状态
const isGenerating = ref(false);
const progress = ref(0);
const generatedImages = ref<GeneratedImage[]>([]);
const error = ref<string | null>(null);

const canGenerate = computed(() => {
  return prompt.value.trim().length > 0 && !isGenerating.value && apiStore.hasApiKey;
});

function handleSeedInput(value: string) {
  const num = parseInt(value);
  seed.value = isNaN(num) ? undefined : num;
}

function generateRandomSeed() {
  const randomSeed = Math.floor(Math.random() * 2147483647);
  seedInput.value = randomSeed.toString();
  seed.value = randomSeed;
}

async function handleGenerate() {
  if (!canGenerate.value) return;

  isGenerating.value = true;
  progress.value = 10;
  error.value = null;

  try {
    const apiService = createApiService(apiStore.activeProvider, apiStore.currentConfig);
    progress.value = 20;

    const response = await apiService.textToImage({
      prompt: prompt.value,
      negativePrompt: negativePrompt.value || undefined,
      model: model.value,
      aspectRatio: aspectRatio.value,
      resolution: resolution.value,
      numImages: numImages.value,
      seed: seed.value,
      outputFormat: outputFormat.value,
    });

    progress.value = 90;

    if (response.success && response.images.length > 0) {
      generatedImages.value = response.images;
      ElMessage.success('图像生成成功！');
    } else {
      error.value = response.error || '生成失败，请重试';
      ElMessage.error(response.error || '生成失败');
    }
  } catch (err) {
    console.error('Generation error:', err);
    error.value = err instanceof Error ? err.message : '未知错误';
    ElMessage.error(error.value);
  } finally {
    isGenerating.value = false;
    progress.value = 100;
  }
}

function viewImage(image: GeneratedImage) {
  window.open(image.url, '_blank');
}

function downloadImage(image: GeneratedImage) {
  const link = document.createElement('a');
  link.href = image.url;
  link.download = image.fileName;
  link.click();
}

function downloadAll() {
  generatedImages.value.forEach(downloadImage);
}

function clearResults() {
  generatedImages.value = [];
  error.value = null;
  progress.value = 0;
}
</script>

<style lang="scss" scoped>
.text-to-image-page {
  height: 100%;
}

.page-container {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 24px;
  height: 100%;
}

.control-panel {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-header {
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
  }
  p {
    color: var(--text-secondary);
    font-size: 13px;
    margin-top: 4px;
  }
}

.panel-section {
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }
}

.size-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  .size-item {
    display: flex;
    flex-direction: column;
    gap: 6px;

    label {
      font-size: 12px;
      color: var(--text-secondary);
    }
  }
}

.param-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.param-row {
  display: flex;
  align-items: center;
  gap: 12px;

  label {
    flex: 1;
    font-size: 13px;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.generate-section {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);

  .generate-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
  }

  .api-warning {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding: 12px;
    background: rgba(245, 158, 11, 0.1);
    border-radius: 8px;
    font-size: 13px;
    color: #f59e0b;

    a {
      color: var(--primary-color);
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.preview-panel {
  background: var(--bg-secondary);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);

    h3 {
      font-size: 16px;
      font-weight: 600;
    }

    .preview-actions {
      display: flex;
      gap: 8px;
    }
  }

  .preview-content {
    flex: 1;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
  }
}

.generating-state {
  text-align: center;

  .generating-animation {
    margin-bottom: 16px;
    color: var(--primary-color);
  }

  p {
    font-size: 16px;
    color: var(--text-primary);
    margin-bottom: 16px;
  }

  .el-progress {
    width: 200px;
  }
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(256px, 1fr));
  gap: 16px;
  width: 100%;

  .result-item {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    aspect-ratio: 1;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .result-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover .result-overlay {
      opacity: 1;
    }
  }
}

.empty-state {
  text-align: center;
  color: var(--text-secondary);

  p {
    margin-top: 16px;
    font-size: 16px;
  }

  .sub-text {
    font-size: 14px;
    margin-top: 8px;
  }
}

.error-state {
  text-align: center;
  color: #ef4444;

  p {
    margin: 16px 0;
  }
}

.w-full {
  width: 100%;
}
</style>
