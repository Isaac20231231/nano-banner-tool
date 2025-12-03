// API 提供商类型
export type ApiProvider = 'fal' | 'google' | 'custom';

// 模型类型
export type ModelType = 'nano-banana' | 'nano-banana-pro';

// 宽高比类型
export type AspectRatio =
  | '1:1' | '2:3' | '3:2' | '3:4' | '4:3'
  | '4:5' | '5:4' | '9:16' | '16:9' | '21:9' | 'auto';

// 分辨率类型
export type Resolution = '1K' | '2K' | '4K';

// 输出格式类型
export type OutputFormat = 'png' | 'jpeg' | 'webp';

// API 配置
export interface ApiConfig {
  provider: ApiProvider;
  apiKey: string;
  baseUrl?: string;
  proxy?: string;
  timeout?: number;
}

// 文生图请求
export interface TextToImageRequest {
  prompt: string;
  negativePrompt?: string;
  numImages?: number;
  aspectRatio?: AspectRatio;
  resolution?: Resolution;
  outputFormat?: OutputFormat;
  seed?: number;
  model?: ModelType;
}

// 图生图请求
export interface ImageToImageRequest extends TextToImageRequest {
  referenceImages: string[];
  editStrength?: number;
}

// 生成的图片
export interface GeneratedImage {
  id: string;
  url: string;
  localPath?: string;
  contentType: string;
  fileName: string;
  width?: number;
  height?: number;
}

// 生成响应
export interface GenerateResponse {
  success: boolean;
  images: GeneratedImage[];
  description?: string;
  error?: string;
  cost?: number;
}

// 生成任务
export interface GenerationTask {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  request: TextToImageRequest | ImageToImageRequest;
  response?: GenerateResponse;
  createdAt: Date;
  completedAt?: Date;
}
