<template>
  <div class="gallery-page">
    <div class="page-header">
      <div class="header-left">
        <h2>素材库</h2>
        <p>管理你的图片素材 ({{ galleryStore.images.length }} 张)</p>
      </div>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索素材..."
          prefix-icon="Search"
          clearable
          style="width: 200px"
          @input="handleSearch"
        />
        <el-button type="primary" :loading="isImporting" @click="handleImport">
          <el-icon v-if="!isImporting"><Upload /></el-icon>
          {{ isImporting ? '导入中...' : '导入图片' }}
        </el-button>
      </div>
    </div>

    <!-- 工具栏 -->
    <div v-if="galleryStore.images.length > 0" class="toolbar">
      <div class="toolbar-left">
        <el-checkbox
          :model-value="isAllSelected"
          :indeterminate="isIndeterminate"
          @change="handleSelectAll"
        >
          全选
        </el-checkbox>
        <span v-if="galleryStore.hasSelection" class="selection-info">
          已选择 {{ galleryStore.selectedIds.size }} 项
        </span>
      </div>
      <div class="toolbar-center">
        <el-select v-model="filterTag" placeholder="筛选标签" clearable style="width: 150px">
          <el-option
            v-for="tag in galleryStore.allTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
        <el-select v-model="sortOption" style="width: 140px" @change="handleSortChange">
          <el-option value="date-desc" label="最新优先" />
          <el-option value="date-asc" label="最早优先" />
          <el-option value="name-asc" label="名称 A-Z" />
          <el-option value="name-desc" label="名称 Z-A" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button
          v-if="galleryStore.hasSelection"
          type="danger"
          plain
          @click="handleDeleteSelected"
        >
          <el-icon><Delete /></el-icon>
          删除选中
        </el-button>
        <el-button-group>
          <el-button :type="viewMode === 'grid' ? 'primary' : 'default'" @click="viewMode = 'grid'">
            <el-icon><Grid /></el-icon>
          </el-button>
          <el-button :type="viewMode === 'list' ? 'primary' : 'default'" @click="viewMode = 'list'">
            <el-icon><List /></el-icon>
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="gallery-content">
      <!-- 空状态 -->
      <div v-if="galleryStore.images.length === 0" class="empty-state">
        <el-icon :size="64"><FolderOpened /></el-icon>
        <h3>素材库为空</h3>
        <p>导入或生成图片后，将显示在这里</p>
        <el-button type="primary" :loading="isImporting" @click="handleImport">
          <el-icon v-if="!isImporting"><Upload /></el-icon>
          {{ isImporting ? '导入中...' : '导入图片' }}
        </el-button>
      </div>

      <!-- 无搜索结果 -->
      <div v-else-if="galleryStore.filteredImages.length === 0" class="empty-state">
        <el-icon :size="64"><Search /></el-icon>
        <h3>没有找到匹配的素材</h3>
        <p>尝试调整搜索条件或筛选标签</p>
        <el-button @click="clearFilters">清除筛选</el-button>
      </div>

      <!-- 网格视图 -->
      <div v-else-if="viewMode === 'grid'" class="image-grid">
        <div
          v-for="image in galleryStore.filteredImages"
          :key="image.id"
          class="image-card"
          :class="{ selected: galleryStore.selectedIds.has(image.id) }"
          @click="handleImageClick(image, $event)"
        >
          <div class="image-wrapper">
            <img :src="image.filePath" :alt="image.id" loading="lazy" />
            <div class="image-overlay">
              <el-checkbox
                :model-value="galleryStore.selectedIds.has(image.id)"
                class="select-checkbox"
                @click.stop
                @change="galleryStore.toggleSelect(image.id)"
              />
              <div class="image-actions">
                <el-button circle size="small" @click.stop="viewImage(image)">
                  <el-icon><ZoomIn /></el-icon>
                </el-button>
                <el-button circle size="small" @click.stop="downloadImage(image)">
                  <el-icon><Download /></el-icon>
                </el-button>
                <el-button circle size="small" @click.stop="editTags(image)">
                  <el-icon><PriceTag /></el-icon>
                </el-button>
                <el-button circle size="small" type="danger" @click.stop="deleteImage(image)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
          <div v-if="image.tags.length > 0" class="image-tags">
            <el-tag
              v-for="tag in image.tags.slice(0, 3)"
              :key="tag"
              size="small"
              type="info"
            >
              {{ tag }}
            </el-tag>
            <el-tag v-if="image.tags.length > 3" size="small" type="info">
              +{{ image.tags.length - 3 }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="image-list">
        <div
          v-for="image in galleryStore.filteredImages"
          :key="image.id"
          class="list-item"
          :class="{ selected: galleryStore.selectedIds.has(image.id) }"
        >
          <el-checkbox
            :model-value="galleryStore.selectedIds.has(image.id)"
            @change="galleryStore.toggleSelect(image.id)"
          />
          <div class="list-thumbnail" @click="viewImage(image)">
            <img :src="image.filePath" :alt="image.id" loading="lazy" />
          </div>
          <div class="list-info">
            <div class="list-name">{{ getFileName(image.filePath) }}</div>
            <div class="list-date">{{ formatDate(image.createdAt) }}</div>
            <div v-if="image.tags.length > 0" class="list-tags">
              <el-tag
                v-for="tag in image.tags"
                :key="tag"
                size="small"
                type="info"
                closable
                @close="galleryStore.removeTagFromImage(image.id, tag)"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
          <div class="list-actions">
            <el-button size="small" @click="viewImage(image)">
              <el-icon><ZoomIn /></el-icon>
              查看
            </el-button>
            <el-button size="small" @click="downloadImage(image)">
              <el-icon><Download /></el-icon>
              下载
            </el-button>
            <el-button size="small" @click="editTags(image)">
              <el-icon><PriceTag /></el-icon>
              标签
            </el-button>
            <el-button size="small" type="danger" @click="deleteImage(image)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      style="display: none"
      @change="handleFileSelect"
    />

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="80%" top="5vh">
      <div class="preview-container">
        <img v-if="previewImage" :src="previewImage.filePath" alt="预览" />
      </div>
      <template #footer>
        <el-button @click="downloadImage(previewImage!)">
          <el-icon><Download /></el-icon>
          下载
        </el-button>
        <el-button @click="previewVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 标签编辑对话框 -->
    <el-dialog v-model="tagDialogVisible" title="编辑标签" width="500px">
      <div class="tag-editor">
        <div class="current-tags">
          <el-tag
            v-for="tag in editingTags"
            :key="tag"
            closable
            @close="removeEditingTag(tag)"
          >
            {{ tag }}
          </el-tag>
        </div>
        <el-input
          v-model="newTag"
          placeholder="输入新标签，按回车添加"
          @keyup.enter="addNewTag"
        >
          <template #append>
            <el-button @click="addNewTag">添加</el-button>
          </template>
        </el-input>
        <div class="suggested-tags">
          <span>常用标签：</span>
          <el-tag
            v-for="tag in suggestedTags"
            :key="tag"
            class="suggested-tag"
            @click="addSuggestedTag(tag)"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
      <template #footer>
        <el-button @click="tagDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTags">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useGalleryStore } from '@/stores';
import type { GalleryImage } from '@/types';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Upload,
  Search,
  Delete,
  Grid,
  List,
  FolderOpened,
  ZoomIn,
  Download,
  PriceTag,
} from '@element-plus/icons-vue';

const galleryStore = useGalleryStore();

// 视图状态
const viewMode = ref<'grid' | 'list'>('grid');
const searchQuery = ref('');
const filterTag = ref('');
const sortOption = ref('date-desc');
const isImporting = ref(false);

// 文件输入引用
const fileInput = ref<HTMLInputElement | null>(null);

// 预览
const previewVisible = ref(false);
const previewImage = ref<GalleryImage | null>(null);

// 标签编辑
const tagDialogVisible = ref(false);
const editingImage = ref<GalleryImage | null>(null);
const editingTags = ref<string[]>([]);
const newTag = ref('');

// 常用标签建议
const suggestedTags = ['产品', '背景', '素材', '参考', '人物', '风景', '图标', 'Banner'];

// 计算属性
const isAllSelected = computed(() => {
  if (galleryStore.filteredImages.length === 0) return false;
  return galleryStore.filteredImages.every((img) =>
    galleryStore.selectedIds.has(img.id)
  );
});

const isIndeterminate = computed(() => {
  if (galleryStore.selectedIds.size === 0) return false;
  return !isAllSelected.value && galleryStore.hasSelection;
});

// 监听筛选变化
watch(filterTag, (val) => {
  galleryStore.setFilter(val);
});

// 方法
function handleSearch(value: string) {
  galleryStore.setSearch(value);
}

function handleSortChange(option: string) {
  const [by, order] = option.split('-') as ['date' | 'name', 'asc' | 'desc'];
  galleryStore.setSort(by, order);
}

function handleSelectAll(checked: boolean) {
  if (checked) {
    galleryStore.selectAll();
  } else {
    galleryStore.clearSelection();
  }
}

async function handleImport() {
  if (isImporting.value) return;

  isImporting.value = true;

  try {
    // 检测是否在 Tauri 环境中
    if (window.__TAURI_INTERNALS__) {
      // 使用 Tauri dialog API
      const { open } = await import('@tauri-apps/plugin-dialog');
      const { readFile } = await import('@tauri-apps/plugin-fs');

      const selected = await open({
        multiple: true,
        filters: [{
          name: '图片',
          extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp']
        }]
      });

      if (!selected || (Array.isArray(selected) && selected.length === 0)) {
        return;
      }

      const paths = Array.isArray(selected) ? selected : [selected];
      const imageDataList: { url: string; tags: string[] }[] = [];

      for (const filePath of paths) {
        try {
          const contents = await readFile(filePath);
          // 获取文件扩展名
          const ext = filePath.split('.').pop()?.toLowerCase() || 'png';
          const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
          // 转换为 base64
          const base64 = btoa(
            new Uint8Array(contents).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          const dataUrl = `data:${mimeType};base64,${base64}`;

          imageDataList.push({
            url: dataUrl,
            tags: [],
          });
        } catch (err) {
          console.error('Error reading file:', filePath, err);
        }
      }

      if (imageDataList.length > 0) {
        galleryStore.addImages(imageDataList);
        ElMessage.success(`成功导入 ${imageDataList.length} 张图片`);
      }
    } else {
      // 浏览器环境，使用原生 input
      fileInput.value?.click();
    }
  } catch (error) {
    console.error('Import error:', error);
    ElMessage.error('导入失败，请重试');
  } finally {
    isImporting.value = false;
  }
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;

  if (!files || files.length === 0) {
    return;
  }

  const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

  if (imageFiles.length === 0) {
    ElMessage.warning('请选择图片文件');
    return;
  }

  const imageDataList: { url: string; tags: string[] }[] = [];
  let loadedCount = 0;

  imageFiles.forEach((file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        imageDataList.push({
          url: e.target.result as string,
          tags: [],
        });
      }
      loadedCount++;

      if (loadedCount === imageFiles.length) {
        if (imageDataList.length > 0) {
          galleryStore.addImages(imageDataList);
          ElMessage.success(`成功导入 ${imageDataList.length} 张图片`);
        }
      }
    };

    reader.onerror = () => {
      loadedCount++;
    };

    reader.readAsDataURL(file);
  });

  input.value = '';
}

function handleImageClick(image: GalleryImage, event: MouseEvent) {
  // 如果按住 Ctrl/Cmd，切换选择
  if (event.ctrlKey || event.metaKey) {
    galleryStore.toggleSelect(image.id);
  } else {
    // 否则预览图片
    viewImage(image);
  }
}

function viewImage(image: GalleryImage) {
  previewImage.value = image;
  previewVisible.value = true;
}

function downloadImage(image: GalleryImage) {
  const link = document.createElement('a');
  link.href = image.filePath;
  link.download = getFileName(image.filePath);
  link.click();
}

function deleteImage(image: GalleryImage) {
  ElMessageBox.confirm('确定要删除这张图片吗？', '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      galleryStore.removeImage(image.id);
      ElMessage.success('图片已删除');
    })
    .catch(() => {});
}

function handleDeleteSelected() {
  const count = galleryStore.selectedIds.size;
  ElMessageBox.confirm(`确定要删除选中的 ${count} 张图片吗？`, '批量删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      const ids = Array.from(galleryStore.selectedIds);
      galleryStore.removeImages(ids);
      ElMessage.success(`已删除 ${count} 张图片`);
    })
    .catch(() => {});
}

function editTags(image: GalleryImage) {
  editingImage.value = image;
  editingTags.value = [...image.tags];
  newTag.value = '';
  tagDialogVisible.value = true;
}

function addNewTag() {
  const tag = newTag.value.trim();
  if (tag && !editingTags.value.includes(tag)) {
    editingTags.value.push(tag);
    newTag.value = '';
  }
}

function removeEditingTag(tag: string) {
  editingTags.value = editingTags.value.filter((t) => t !== tag);
}

function addSuggestedTag(tag: string) {
  if (!editingTags.value.includes(tag)) {
    editingTags.value.push(tag);
  }
}

function saveTags() {
  if (editingImage.value) {
    galleryStore.updateImageTags(editingImage.value.id, editingTags.value);
    ElMessage.success('标签已保存');
    tagDialogVisible.value = false;
  }
}

function clearFilters() {
  searchQuery.value = '';
  filterTag.value = '';
  galleryStore.setSearch('');
  galleryStore.setFilter('');
}

function getFileName(filePath: string): string {
  // 对于 data URL，生成一个默认名称
  if (filePath.startsWith('data:')) {
    return `image_${Date.now()}.png`;
  }
  return filePath.split('/').pop() || 'image';
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 初始化
onMounted(() => {
  galleryStore.loadFromStorage();
});
</script>

<style lang="scss" scoped>
.gallery-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;

  .header-left {
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

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin-bottom: 16px;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .selection-info {
      font-size: 13px;
      color: var(--text-secondary);
    }
  }

  .toolbar-center {
    display: flex;
    gap: 12px;
  }

  .toolbar-right {
    display: flex;
    gap: 12px;
  }
}

.gallery-content {
  flex: 1;
  overflow-y: auto;
}

.empty-state {
  height: 100%;
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

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.image-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

    .image-overlay {
      opacity: 1;
    }
  }

  &.selected {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;

    .select-checkbox {
      opacity: 1;
    }
  }

  .image-wrapper {
    position: relative;
    aspect-ratio: 1;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: opacity 0.2s;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 12px;

      .select-checkbox {
        opacity: 0;
        transition: opacity 0.2s;
      }

      .image-actions {
        display: flex;
        justify-content: center;
        gap: 8px;
      }
    }
  }

  .image-tags {
    padding: 8px 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
}

.image-list {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .list-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    background: var(--bg-secondary);
    border-radius: 8px;
    transition: background 0.2s;

    &:hover {
      background: var(--bg-tertiary);
    }

    &.selected {
      outline: 2px solid var(--primary-color);
      outline-offset: -2px;
    }

    .list-thumbnail {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .list-info {
      flex: 1;
      min-width: 0;

      .list-name {
        font-weight: 500;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .list-date {
        font-size: 12px;
        color: var(--text-secondary);
        margin-top: 4px;
      }

      .list-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 8px;
      }
    }

    .list-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }
  }
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 70vh;
  overflow: auto;

  img {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
  }
}

.tag-editor {
  .current-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    min-height: 32px;
    margin-bottom: 16px;
  }

  .suggested-tags {
    margin-top: 16px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-secondary);

    .suggested-tag {
      cursor: pointer;

      &:hover {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }
    }
  }
}
</style>
