export * from './api';

// 应用设置
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'zh-CN' | 'en-US';
  saveDirectory: string;
  autoSave: boolean;
  defaultModel: string;
  defaultResolution: string;
  defaultAspectRatio: string;
}

// 历史记录项
export interface HistoryItem {
  id: string;
  prompt: string;
  negativePrompt?: string;
  model: string;
  parameters: Record<string, unknown>;
  referenceImages?: string[];
  outputImages: string[];
  createdAt: Date;
  tags?: string[];
  favorite: boolean;
}

// 提示词模板
export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  prompt: string;
  negativePrompt?: string;
  previewImage?: string;
  usageCount: number;
  createdAt: Date;
}

// 素材图片
export interface GalleryImage {
  id: string;
  filePath: string;
  thumbnailPath?: string;
  tags: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
