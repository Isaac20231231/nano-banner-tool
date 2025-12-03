import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { GalleryImage } from '@/types';

export const useGalleryStore = defineStore('gallery', () => {
  // 素材列表
  const images = ref<GalleryImage[]>([]);

  // 选中的图片
  const selectedIds = ref<Set<string>>(new Set());

  // 筛选条件
  const filterTag = ref<string>('');
  const searchQuery = ref<string>('');
  const sortBy = ref<'date' | 'name'>('date');
  const sortOrder = ref<'asc' | 'desc'>('desc');

  // 计算属性
  const filteredImages = computed(() => {
    let result = [...images.value];

    // 按标签筛选
    if (filterTag.value) {
      result = result.filter((img) => img.tags.includes(filterTag.value));
    }

    // 按搜索词筛选
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(
        (img) =>
          img.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          img.filePath.toLowerCase().includes(query)
      );
    }

    // 排序
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy.value === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        comparison = a.filePath.localeCompare(b.filePath);
      }
      return sortOrder.value === 'asc' ? comparison : -comparison;
    });

    return result;
  });

  const allTags = computed(() => {
    const tagSet = new Set<string>();
    images.value.forEach((img) => {
      img.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  });

  const selectedImages = computed(() => {
    return images.value.filter((img) => selectedIds.value.has(img.id));
  });

  const hasSelection = computed(() => selectedIds.value.size > 0);

  // 方法
  function generateId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  function addImage(imageData: { url: string; tags?: string[]; metadata?: Record<string, unknown> }): GalleryImage {
    const newImage: GalleryImage = {
      id: generateId(),
      filePath: imageData.url,
      tags: imageData.tags || [],
      metadata: imageData.metadata,
      createdAt: new Date(),
    };
    images.value.unshift(newImage);
    saveToStorage();
    return newImage;
  }

  function addImages(imageDataList: { url: string; tags?: string[]; metadata?: Record<string, unknown> }[]): GalleryImage[] {
    const newImages = imageDataList.map((data) => ({
      id: generateId(),
      filePath: data.url,
      tags: data.tags || [],
      metadata: data.metadata,
      createdAt: new Date(),
    }));
    images.value.unshift(...newImages);
    saveToStorage();
    return newImages;
  }

  function removeImage(id: string) {
    const index = images.value.findIndex((img) => img.id === id);
    if (index !== -1) {
      images.value.splice(index, 1);
      selectedIds.value.delete(id);
      saveToStorage();
    }
  }

  function removeImages(ids: string[]) {
    ids.forEach((id) => {
      const index = images.value.findIndex((img) => img.id === id);
      if (index !== -1) {
        images.value.splice(index, 1);
        selectedIds.value.delete(id);
      }
    });
    saveToStorage();
  }

  function updateImageTags(id: string, tags: string[]) {
    const image = images.value.find((img) => img.id === id);
    if (image) {
      image.tags = tags;
      saveToStorage();
    }
  }

  function addTagToImage(id: string, tag: string) {
    const image = images.value.find((img) => img.id === id);
    if (image && !image.tags.includes(tag)) {
      image.tags.push(tag);
      saveToStorage();
    }
  }

  function removeTagFromImage(id: string, tag: string) {
    const image = images.value.find((img) => img.id === id);
    if (image) {
      image.tags = image.tags.filter((t) => t !== tag);
      saveToStorage();
    }
  }

  function toggleSelect(id: string) {
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id);
    } else {
      selectedIds.value.add(id);
    }
  }

  function selectAll() {
    filteredImages.value.forEach((img) => {
      selectedIds.value.add(img.id);
    });
  }

  function clearSelection() {
    selectedIds.value.clear();
  }

  function setFilter(tag: string) {
    filterTag.value = tag;
  }

  function setSearch(query: string) {
    searchQuery.value = query;
  }

  function setSort(by: 'date' | 'name', order: 'asc' | 'desc') {
    sortBy.value = by;
    sortOrder.value = order;
  }

  function clearAll() {
    images.value = [];
    selectedIds.value.clear();
    saveToStorage();
  }

  // 持久化
  function saveToStorage() {
    try {
      localStorage.setItem('gallery_images', JSON.stringify(images.value));
    } catch (e) {
      console.error('Failed to save gallery to storage:', e);
    }
  }

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem('gallery_images');
      if (saved) {
        const parsed = JSON.parse(saved);
        images.value = parsed.map((img: GalleryImage) => ({
          ...img,
          createdAt: new Date(img.createdAt),
        }));
      }
    } catch (e) {
      console.error('Failed to load gallery from storage:', e);
    }
  }

  return {
    images,
    selectedIds,
    filterTag,
    searchQuery,
    sortBy,
    sortOrder,
    filteredImages,
    allTags,
    selectedImages,
    hasSelection,
    addImage,
    addImages,
    removeImage,
    removeImages,
    updateImageTags,
    addTagToImage,
    removeTagFromImage,
    toggleSelect,
    selectAll,
    clearSelection,
    setFilter,
    setSearch,
    setSort,
    clearAll,
    loadFromStorage,
  };
});
