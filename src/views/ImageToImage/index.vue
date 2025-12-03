<template>
  <div class="image-to-image-page">
    <div class="page-container">
      <!-- 左侧控制面板 -->
      <div class="control-panel">
        <div class="panel-header">
          <h2>图生图</h2>
          <p>基于参考图生成或编辑图像</p>
        </div>

        <!-- 参考图上传 -->
        <div class="panel-section">
          <h3 class="section-title">
            <el-icon><PictureFilled /></el-icon>
            参考图
            <span class="required">*必须</span>
          </h3>

          <div class="upload-area">
            <el-upload
              class="image-uploader"
              drag
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              accept="image/*"
              @change="handleImageUpload"
            >
              <div v-if="referenceImage" class="preview-wrapper">
                <img :src="referenceImage" alt="参考图" class="preview-image" />
                <div class="preview-overlay">
                  <el-button circle @click.stop="clearReferenceImage">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
              <div v-else class="upload-placeholder">
                <el-icon class="upload-icon"><Upload /></el-icon>
                <div class="upload-text">拖拽或点击上传参考图</div>
                <div class="upload-tip">支持 PNG, JPG, WebP</div>
              </div>
            </el-upload>
          </div>

          <!-- 额外参考图 -->
          <div v-if="referenceImage" class="extra-images">
            <div class="extra-header">
              <span>额外参考图 (可选)</span>
              <el-button size="small" text @click="addExtraImage">
                <el-icon><Plus /></el-icon>
                添加
              </el-button>
            </div>
            <div v-if="extraImages.length > 0" class="extra-list">
              <div
                v-for="(img, index) in extraImages"
                :key="index"
                class="extra-item"
              >
                <img :src="img" alt="额外参考图" />
                <button class="remove-btn" @click="removeExtraImage(index)">
                  <el-icon><Close /></el-icon>
                </button>
              </div>
            </div>
          </div>
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
            :rows="4"
            placeholder="描述你想要的变化，如：将背景改为海滩、添加一只猫..."
            :maxlength="2000"
            show-word-limit
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

        <!-- 编辑参数 -->
        <div class="panel-section">
          <h3 class="section-title">
            <el-icon><Setting /></el-icon>
            编辑参数
          </h3>

          <div class="param-group">
            <div class="param-item">
              <div class="param-header">
                <label>编辑强度</label>
                <span class="param-value">{{ editStrength }}%</span>
              </div>
              <el-slider
                v-model="editStrength"
                :min="10"
                :max="100"
                :step="5"
                :show-tooltip="false"
              />
              <div class="param-tips">
                <span>保持原图</span>
                <span>大幅修改</span>
              </div>
            </div>

            <div class="param-row">
              <label>宽高比</label>
              <el-select v-model="aspectRatio" size="small">
                <el-option value="auto" label="自动 (保持原图)" />
                <el-option value="1:1" label="1:1 正方形" />
                <el-option value="16:9" label="16:9 横屏" />
                <el-option value="9:16" label="9:16 竖屏" />
                <el-option value="4:3" label="4:3" />
                <el-option value="3:4" label="3:4" />
              </el-select>
            </div>

            <div class="param-row">
              <label>分辨率</label>
              <el-select v-model="resolution" size="small">
                <el-option value="1K" label="1K 标准" />
                <el-option value="2K" label="2K 高清" />
                <el-option value="4K" label="4K 超清" />
              </el-select>
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

          <div v-if="!referenceImage" class="upload-warning">
            <el-icon><WarningFilled /></el-icon>
            <span>请先上传参考图</span>
          </div>

          <div v-else-if="!apiStore.hasApiKey" class="api-warning">
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
            <p>AI 正在编辑图像...</p>
            <el-progress :percentage="progress" :stroke-width="8" :show-text="false" />
          </div>

          <!-- 生成结果对比 -->
          <div v-else-if="generatedImages.length > 0" class="result-compare">
            <div class="compare-grid">
              <!-- 原图 -->
              <div class="compare-item original">
                <div class="compare-label">原图</div>
                <img :src="referenceImage ?? ''" alt="原图" />
              </div>
              <!-- 生成结果 -->
              <div
                v-for="image in generatedImages"
                :key="image.id"
                class="compare-item result"
                @click="viewImage(image)"
              >
                <div class="compare-label">生成结果</div>
                <img :src="image.url" :alt="image.fileName" />
                <div class="result-overlay">
                  <el-button circle size="small" @click.stop="downloadImage(image)">
                    <el-icon><Download /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <el-icon :size="64"><PictureFilled /></el-icon>
            <p>上传参考图并描述想要的变化</p>
            <p class="sub-text">AI 将基于参考图生成新图像</p>
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

    <!-- 隐藏的文件选择器（用于添加额外参考图） -->
    <input
      ref="extraImageInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleExtraImageSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useApiStore } from '@/stores';
import { createApiService } from '@/services/api';
import type { GeneratedImage, AspectRatio, Resolution, OutputFormat, ModelType } from '@/types';
import type { UploadFile } from 'element-plus';
import { ElMessage } from 'element-plus';
import {
  PictureFilled,
  Upload,
  Delete,
  Plus,
  Close,
  EditPen,
  Cpu,
  Setting,
  MagicStick,
  WarningFilled,
  Download,
  Loading,
  CircleCloseFilled,
} from '@element-plus/icons-vue';

const apiStore = useApiStore();

// 参考图
const referenceImage = ref<string | null>(null);
const extraImages = ref<string[]>([]);
const extraImageInput = ref<HTMLInputElement | null>(null);

// 表单状态
const prompt = ref('');
const model = ref<ModelType>('nano-banana-pro');
const editStrength = ref(50);
const aspectRatio = ref<AspectRatio | 'auto'>('auto');
const resolution = ref<Resolution>('1K');
const outputFormat = ref<OutputFormat>('png');

// 生成状态
const isGenerating = ref(false);
const progress = ref(0);
const generatedImages = ref<GeneratedImage[]>([]);
const error = ref<string | null>(null);

const canGenerate = computed(() => {
  return (
    referenceImage.value !== null &&
    prompt.value.trim().length > 0 &&
    !isGenerating.value &&
    apiStore.hasApiKey
  );
});

function handleImageUpload(file: UploadFile) {
  if (file.raw) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        referenceImage.value = e.target.result as string;
      }
    };
    reader.readAsDataURL(file.raw);
  }
}

function clearReferenceImage() {
  referenceImage.value = null;
  extraImages.value = [];
}

function addExtraImage() {
  extraImageInput.value?.click();
}

function handleExtraImageSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file && extraImages.value.length < 4) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        extraImages.value.push(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }
  input.value = '';
}

function removeExtraImage(index: number) {
  extraImages.value.splice(index, 1);
}

async function handleGenerate() {
  if (!canGenerate.value || !referenceImage.value) return;

  isGenerating.value = true;
  progress.value = 10;
  error.value = null;

  try {
    const apiService = createApiService(apiStore.activeProvider, apiStore.currentConfig);
    progress.value = 20;

    // 合并所有参考图
    const allReferenceImages = [referenceImage.value, ...extraImages.value];

    const response = await apiService.imageToImage({
      prompt: prompt.value,
      referenceImages: allReferenceImages,
      model: model.value,
      aspectRatio: aspectRatio.value === 'auto' ? undefined : aspectRatio.value,
      resolution: resolution.value,
      outputFormat: outputFormat.value,
      editStrength: editStrength.value / 100,
    });

    progress.value = 90;

    if (response.success && response.images.length > 0) {
      generatedImages.value = response.images;
      ElMessage.success('图像编辑成功！');
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
.image-to-image-page {
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

    .required {
      font-size: 12px;
      font-weight: 400;
      color: #ef4444;
    }
  }
}

.upload-area {
  .image-uploader {
    width: 100%;

    :deep(.el-upload-dragger) {
      padding: 0;
      border-color: var(--border-color);
      background: var(--bg-tertiary);
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        border-color: var(--primary-color);
      }
    }
  }

  .preview-wrapper {
    position: relative;
    width: 100%;
    height: 100%;

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .preview-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover .preview-overlay {
      opacity: 1;
    }
  }

  .upload-placeholder {
    text-align: center;

    .upload-icon {
      font-size: 40px;
      color: var(--text-secondary);
    }

    .upload-text {
      font-size: 14px;
      color: var(--text-primary);
      margin-top: 12px;
    }

    .upload-tip {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 4px;
    }
  }
}

.extra-images {
  margin-top: 12px;

  .extra-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }

  .extra-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .extra-item {
      position: relative;
      width: 60px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .remove-btn {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: none;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;

        &:hover {
          background: #ef4444;
        }
      }
    }
  }
}

.param-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.param-item {
  .param-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    label {
      font-size: 13px;
      color: var(--text-secondary);
    }

    .param-value {
      font-size: 13px;
      font-weight: 600;
      color: var(--primary-color);
    }
  }

  .param-tips {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--text-secondary);
    margin-top: 4px;
  }
}

.param-row {
  display: flex;
  align-items: center;
  gap: 12px;

  label {
    flex: 1;
    font-size: 13px;
    color: var(--text-secondary);
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

  .upload-warning,
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

.result-compare {
  width: 100%;

  .compare-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }

  .compare-item {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    background: var(--bg-tertiary);

    .compare-label {
      position: absolute;
      top: 12px;
      left: 12px;
      padding: 4px 12px;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 4px;
      font-size: 12px;
      color: white;
      z-index: 1;
    }

    img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: contain;
    }

    &.result {
      cursor: pointer;

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
