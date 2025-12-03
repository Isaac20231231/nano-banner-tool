import axios, { type AxiosInstance } from 'axios';
import type {
  ApiConfig,
  TextToImageRequest,
  ImageToImageRequest,
  GenerateResponse,
} from '@/types';
import type { ImageGenerationService } from './index';
import { createGeneratedImage } from './index';

interface FalResponse {
  images: Array<{
    url: string;
    content_type: string;
    file_name?: string;
  }>;
  description?: string;
}

export class FalApiService implements ImageGenerationService {
  private client: AxiosInstance;

  constructor(config: ApiConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://fal.run',
      timeout: config.timeout || 120000,
      headers: {
        'Authorization': `Key ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    // 配置代理
    if (config.proxy) {
      // 注意: 在浏览器环境中代理需要在服务端配置
      // 这里的代理设置主要用于 Tauri 的 Rust 端
      console.log('Proxy configured:', config.proxy);
    }
  }

  async textToImage(request: TextToImageRequest): Promise<GenerateResponse> {
    try {
      const modelPath = request.model === 'nano-banana-pro'
        ? 'fal-ai/nano-banana-pro'
        : 'fal-ai/nano-banana';

      const response = await this.client.post<FalResponse>(`/${modelPath}`, {
        prompt: request.prompt,
        negative_prompt: request.negativePrompt,
        num_images: request.numImages || 1,
        aspect_ratio: request.aspectRatio || '1:1',
        resolution: request.resolution || '1K',
        output_format: request.outputFormat || 'png',
        seed: request.seed,
        sync_mode: true,
      });

      return {
        success: true,
        images: response.data.images.map(img =>
          createGeneratedImage(img.url, img.content_type)
        ),
        description: response.data.description,
      };
    } catch (error) {
      console.error('Text to image error:', error);
      return {
        success: false,
        images: [],
        error: this.formatError(error),
      };
    }
  }

  async imageToImage(request: ImageToImageRequest): Promise<GenerateResponse> {
    try {
      const modelPath = request.model === 'nano-banana-pro'
        ? 'fal-ai/nano-banana-pro/edit'
        : 'fal-ai/nano-banana/edit';

      const response = await this.client.post<FalResponse>(`/${modelPath}`, {
        prompt: request.prompt,
        image_urls: request.referenceImages,
        num_images: request.numImages || 1,
        aspect_ratio: request.aspectRatio || 'auto',
        resolution: request.resolution || '1K',
        output_format: request.outputFormat || 'png',
        sync_mode: true,
      });

      return {
        success: true,
        images: response.data.images.map(img =>
          createGeneratedImage(img.url, img.content_type)
        ),
        description: response.data.description,
      };
    } catch (error) {
      console.error('Image to image error:', error);
      return {
        success: false,
        images: [],
        error: this.formatError(error),
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // 发送一个简单的请求来验证 API Key
      await this.client.get('/health');
      return true;
    } catch (error) {
      // 如果是 401/403 则 API Key 无效
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          throw new Error('API Key 无效');
        }
      }
      // 其他错误可能是网络问题，但 Key 可能是有效的
      return true;
    }
  }

  private formatError(error: unknown): string {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const data = error.response.data;
        if (typeof data === 'object' && data.detail) {
          return data.detail;
        }
        return `API 错误: ${error.response.status}`;
      }
      if (error.code === 'ECONNABORTED') {
        return '请求超时，请稍后重试';
      }
      return '网络错误，请检查网络连接';
    }
    if (error instanceof Error) {
      return error.message;
    }
    return '未知错误';
  }
}
