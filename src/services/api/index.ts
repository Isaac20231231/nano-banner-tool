import type {
  ApiProvider,
  ApiConfig,
  TextToImageRequest,
  ImageToImageRequest,
  GenerateResponse,
  GeneratedImage,
} from '@/types';
import { FalApiService } from './fal';
import { GoogleApiService } from './google';

// API 服务接口
export interface ImageGenerationService {
  textToImage(request: TextToImageRequest): Promise<GenerateResponse>;
  imageToImage(request: ImageToImageRequest): Promise<GenerateResponse>;
  testConnection(): Promise<boolean>;
}

// 创建 API 服务工厂
export function createApiService(
  provider: ApiProvider,
  config: ApiConfig
): ImageGenerationService {
  switch (provider) {
    case 'fal':
      return new FalApiService(config);
    case 'google':
      return new GoogleApiService(config);
    case 'custom':
      // 自定义服务使用 fal 兼容的接口
      return new FalApiService(config);
    default:
      throw new Error(`Unsupported API provider: ${provider}`);
  }
}

// 导出服务类
export { FalApiService } from './fal';
export { GoogleApiService } from './google';

// 工具函数
export function generateImageId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createGeneratedImage(
  url: string,
  contentType = 'image/png'
): GeneratedImage {
  const id = generateImageId();
  const extension = contentType.split('/')[1] || 'png';
  return {
    id,
    url,
    contentType,
    fileName: `${id}.${extension}`,
  };
}
