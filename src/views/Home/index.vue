<template>
  <div class="home-page">
    <div class="home-container">
      <!-- 左侧控制面板 -->
      <div class="control-panel">
        <!-- 预设提示词选择 -->
        <div class="panel-section">
          <h3 class="section-title">
            <el-icon><Collection /></el-icon>
            描述提示词 *
          </h3>
          <el-select
            v-model="presetStore.selectedPresetId"
            placeholder="无预设"
            clearable
            class="w-full preset-select"
            @change="handlePresetChange"
          >
            <el-option
              v-for="(preset, index) in presetStore.presets"
              :key="preset.id"
              :value="preset.id"
              :label="`${index + 1}. ${preset.name}`"
            />
          </el-select>
          <div class="preset-actions">
            <el-button size="small" type="primary" @click="showAddPresetDialog">
              <el-icon><Plus /></el-icon>
              添加
            </el-button>
            <el-button
              size="small"
              :disabled="!presetStore.selectedPresetId"
              @click="showEditPresetDialog"
            >
              <el-icon><EditPen /></el-icon>
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              :disabled="!presetStore.selectedPresetId"
              @click="handleDeletePreset"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>

        <!-- 提示词输入 -->
        <div class="panel-section">
          <h3 class="section-title">
            <el-icon><EditPen /></el-icon>
            提示词
          </h3>
          <el-input
            v-model="generationStore.prompt"
            type="textarea"
            :rows="4"
            placeholder="描述你想要生成的图像..."
            :maxlength="2000"
            show-word-limit
            resize="none"
          />
        </div>

        <!-- 负面提示词 -->
        <div class="panel-section">
          <h3 class="section-title">
            <el-icon><Remove /></el-icon>
            负面提示词
            <span class="optional">(可选)</span>
          </h3>
          <el-input
            v-model="generationStore.negativePrompt"
            type="textarea"
            :rows="2"
            placeholder="不希望出现的内容..."
            resize="none"
          />
        </div>

        <!-- 模型选择 -->
        <div class="panel-section">
          <h3 class="section-title">
            <el-icon><Cpu /></el-icon>
            模型
          </h3>
          <el-select v-model="generationStore.model" class="w-full">
            <el-option value="nano-banana" label="Gemini 2.0 Flash (快速)" />
            <el-option value="nano-banana-pro" label="Gemini 3 Pro Image (高质量)" />
          </el-select>
        </div>

        <!-- 参数设置 -->
        <div class="panel-section">
          <h3 class="section-title">
            <el-icon><Setting /></el-icon>
            参数设置
          </h3>

          <div class="param-grid">
            <div class="param-item">
              <label>画幅比例 (可选)</label>
              <el-select v-model="generationStore.aspectRatio" size="small" placeholder="原画幅" clearable>
                <el-option value="" label="原画幅" />
                <el-option value="1:1" label="1:1 正方形" />
                <el-option value="3:4" label="3:4 竖屏" />
                <el-option value="4:3" label="4:3 横屏" />
                <el-option value="9:16" label="9:16 手机竖屏" />
                <el-option value="16:9" label="16:9 宽屏" />
                <el-option value="2:3" label="2:3 海报竖版" />
                <el-option value="3:2" label="3:2 海报横版" />
              </el-select>
            </div>

            <div class="param-item">
              <label>分辨率</label>
              <el-select v-model="generationStore.resolution" size="small">
                <el-option value="1K" label="1K (标准)" />
                <el-option value="2K" label="2K (高清)" />
                <el-option value="4K" label="4K (超清)" />
              </el-select>
            </div>

            <div class="param-item">
              <label>数量</label>
              <el-input-number
                v-model="generationStore.numImages"
                :min="1"
                :max="4"
                size="small"
              />
            </div>

            <div class="param-item">
              <label>格式</label>
              <el-select v-model="generationStore.outputFormat" size="small">
                <el-option value="png" label="PNG" />
                <el-option value="jpeg" label="JPEG" />
                <el-option value="webp" label="WebP" />
              </el-select>
            </div>
          </div>
        </div>

        <!-- 参考图 -->
        <div class="panel-section">
          <h3 class="section-title">
            <el-icon><PictureFilled /></el-icon>
            参考图
            <span class="optional">(可选)</span>
          </h3>
          <div class="reference-upload">
            <el-upload
              class="upload-area"
              drag
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              accept="image/*"
              @change="handleImageUpload"
            >
              <el-icon class="upload-icon"><Upload /></el-icon>
              <div class="upload-text">拖拽或点击上传参考图</div>
              <div class="upload-tip">支持 PNG, JPG, WebP</div>
            </el-upload>

            <div v-if="generationStore.referenceImages.length > 0" class="reference-list">
              <div
                v-for="(img, index) in generationStore.referenceImages"
                :key="index"
                class="reference-item"
              >
                <img :src="img" alt="参考图" />
                <button class="remove-btn" @click="generationStore.removeReferenceImage(index)">
                  <el-icon><Close /></el-icon>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 生成按钮 -->
        <div class="generate-section">
          <el-button
            type="primary"
            size="large"
            :loading="generationStore.isGenerating"
            :disabled="!generationStore.canGenerate || !apiStore.hasApiKey"
            class="generate-btn"
            @click="handleGenerate"
          >
            <el-icon v-if="!generationStore.isGenerating"><MagicStick /></el-icon>
            {{ generationStore.isGenerating ? `生成中 ${generationStore.progress}%` : '开始生成' }}
          </el-button>

          <div v-if="!apiStore.hasApiKey" class="api-warning">
            <el-icon><WarningFilled /></el-icon>
            <span>请先在设置中配置 API Key</span>
            <router-link to="/settings/api">去配置</router-link>
          </div>
        </div>
      </div>

      <!-- 右侧预览区 -->
      <div class="preview-panel">
        <div class="preview-header">
          <h3>生成结果</h3>
          <div v-if="generationStore.generatedImages.length > 0" class="preview-actions">
            <el-button size="small" @click="downloadAll">
              <el-icon><Download /></el-icon>
              下载全部
            </el-button>
            <el-button size="small" @click="generationStore.clearResults">
              <el-icon><Delete /></el-icon>
              清空
            </el-button>
          </div>
        </div>

        <div class="preview-content">
          <!-- 生成中状态 -->
          <div v-if="generationStore.isGenerating" class="generating-state">
            <div class="generating-animation">
              <el-icon class="is-loading" :size="48"><Loading /></el-icon>
            </div>
            <p>AI 正在创作中...</p>
            <el-progress
              :percentage="generationStore.progress"
              :stroke-width="8"
              :show-text="false"
            />
          </div>

          <!-- 生成结果 -->
          <div
            v-else-if="generationStore.generatedImages.length > 0"
            class="result-grid"
          >
            <div
              v-for="image in generationStore.generatedImages"
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
            <p class="sub-text">生成的图片将显示在这里</p>
          </div>

          <!-- 错误状态 -->
          <div v-if="generationStore.error" class="error-state">
            <el-icon :size="32"><CircleCloseFilled /></el-icon>
            <p>{{ generationStore.error }}</p>
            <el-button size="small" @click="generationStore.clearResults">重试</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 预设编辑对话框 -->
    <el-dialog
      v-model="presetDialogVisible"
      :title="isEditingPreset ? '编辑预设' : '添加预设'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="presetForm" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="presetForm.name" placeholder="请输入预设名称" />
        </el-form-item>
        <el-form-item label="提示词" required>
          <el-input
            v-model="presetForm.prompt"
            type="textarea"
            :rows="4"
            placeholder="请输入提示词内容"
          />
        </el-form-item>
        <el-form-item label="负面提示词">
          <el-input
            v-model="presetForm.negativePrompt"
            type="textarea"
            :rows="2"
            placeholder="可选，不希望出现的内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="presetDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePreset">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useGenerationStore, useApiStore, usePromptPresetsStore } from '@/stores';
import { createApiService } from '@/services/api';
import type { GeneratedImage } from '@/types';
import type { UploadFile } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  EditPen,
  Remove,
  Cpu,
  Setting,
  PictureFilled,
  Upload,
  Close,
  MagicStick,
  WarningFilled,
  Download,
  Delete,
  Loading,
  CircleCloseFilled,
  Collection,
  Plus,
} from '@element-plus/icons-vue';

const generationStore = useGenerationStore();
const apiStore = useApiStore();
const presetStore = usePromptPresetsStore();

// 预设对话框相关
const presetDialogVisible = ref(false);
const isEditingPreset = ref(false);
const editingPresetId = ref<string | null>(null);
const presetForm = reactive({
  name: '',
  prompt: '',
  negativePrompt: '',
});

// 选择预设时更新提示词
function handlePresetChange(presetId: string | null) {
  if (presetId) {
    const preset = presetStore.presets.find(p => p.id === presetId);
    if (preset) {
      generationStore.prompt = preset.prompt;
      if (preset.negativePrompt) {
        generationStore.negativePrompt = preset.negativePrompt;
      }
    }
  }
}

// 显示添加预设对话框
function showAddPresetDialog() {
  isEditingPreset.value = false;
  editingPresetId.value = null;
  presetForm.name = '';
  presetForm.prompt = generationStore.prompt || '';
  presetForm.negativePrompt = generationStore.negativePrompt || '';
  presetDialogVisible.value = true;
}

// 显示编辑预设对话框
function showEditPresetDialog() {
  const preset = presetStore.selectedPreset;
  if (!preset) return;

  isEditingPreset.value = true;
  editingPresetId.value = preset.id;
  presetForm.name = preset.name;
  presetForm.prompt = preset.prompt;
  presetForm.negativePrompt = preset.negativePrompt || '';
  presetDialogVisible.value = true;
}

// 保存预设
function savePreset() {
  if (!presetForm.name.trim()) {
    ElMessage.warning('请输入预设名称');
    return;
  }
  if (!presetForm.prompt.trim()) {
    ElMessage.warning('请输入提示词内容');
    return;
  }

  if (isEditingPreset.value && editingPresetId.value) {
    presetStore.updatePreset(editingPresetId.value, {
      name: presetForm.name.trim(),
      prompt: presetForm.prompt.trim(),
      negativePrompt: presetForm.negativePrompt.trim() || undefined,
    });
    ElMessage.success('预设已更新');
  } else {
    const newPreset = presetStore.addPreset(
      presetForm.name.trim(),
      presetForm.prompt.trim(),
      presetForm.negativePrompt.trim() || undefined
    );
    presetStore.selectPreset(newPreset.id);
    ElMessage.success('预设已添加');
  }
  presetDialogVisible.value = false;
}

// 删除预设
async function handleDeletePreset() {
  const preset = presetStore.selectedPreset;
  if (!preset) return;

  try {
    await ElMessageBox.confirm(
      `确定要删除预设「${preset.name}」吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    presetStore.deletePreset(preset.id);
    ElMessage.success('预设已删除');
  } catch {
    // 用户取消
  }
}

async function handleGenerate() {
  if (!generationStore.canGenerate) return;

  generationStore.startGeneration();
  generationStore.updateProgress(10);

  try {
    // 创建 API 服务实例
    const apiService = createApiService(
      apiStore.activeProvider,
      apiStore.currentConfig
    );

    generationStore.updateProgress(20);

    let response;

    // 根据是否有参考图选择调用方式
    if (generationStore.hasReferenceImages) {
      // 图生图模式
      const request = generationStore.getImageToImageRequest();
      response = await apiService.imageToImage(request);
    } else {
      // 文生图模式
      const request = generationStore.getTextToImageRequest();
      response = await apiService.textToImage(request);
    }

    generationStore.updateProgress(90);

    if (response.success && response.images.length > 0) {
      generationStore.completeGeneration(response.images);
      ElMessage.success('图像生成成功！');
    } else {
      generationStore.failGeneration(response.error || '生成失败，请重试');
      ElMessage.error(response.error || '生成失败，请重试');
    }
  } catch (error) {
    console.error('Generation error:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    generationStore.failGeneration(errorMessage);
    ElMessage.error(errorMessage);
  }
}

function handleImageUpload(file: UploadFile) {
  if (file.raw) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        generationStore.addReferenceImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file.raw);
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
  generationStore.generatedImages.forEach(downloadImage);
}
</script>

<style lang="scss" scoped>
.home-page {
  height: 100%;
}

.home-container {
  display: grid;
  grid-template-columns: 400px 1fr;
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

.panel-section {
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;

    .optional {
      font-weight: 400;
      color: var(--text-secondary);
      font-size: 12px;
    }
  }

  .preset-select {
    margin-bottom: 12px;
  }

  .preset-actions {
    display: flex;
    gap: 8px;
  }
}

.param-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  .param-item {
    display: flex;
    flex-direction: column;
    gap: 6px;

    label {
      font-size: 12px;
      color: var(--text-secondary);
    }
  }
}

.reference-upload {
  .upload-area {
    :deep(.el-upload-dragger) {
      padding: 20px;
      border-color: var(--border-color);
      background: var(--bg-tertiary);

      &:hover {
        border-color: var(--primary-color);
      }
    }
  }

  .upload-icon {
    font-size: 32px;
    color: var(--text-secondary);
  }

  .upload-text {
    font-size: 14px;
    color: var(--text-primary);
    margin-top: 8px;
  }

  .upload-tip {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 4px;
  }

  .reference-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;

    .reference-item {
      position: relative;
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .remove-btn {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: none;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: #ef4444;
        }
      }
    }
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
