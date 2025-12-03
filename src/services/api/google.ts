import type {
  ApiConfig,
  TextToImageRequest,
  ImageToImageRequest,
  GenerateResponse,
} from '@/types';
import type { ImageGenerationService } from './index';
import { createGeneratedImage } from './index';

// 动态导入 Tauri HTTP 插件，支持在非 Tauri 环境下使用原生 fetch
async function tauriFetch(url: string, options?: RequestInit): Promise<Response> {
  // 检查是否在 Tauri 环境中
  if (window.__TAURI_INTERNALS__) {
    try {
      const { fetch: tauriHttpFetch } = await import('@tauri-apps/plugin-http');
      return await tauriHttpFetch(url, options);
    } catch (e) {
      console.warn('Tauri HTTP plugin not available, falling back to native fetch', e);
    }
  }
  // 回退到原生 fetch
  return await fetch(url, options);
}

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text?: string;
        inline_data?: {
          mime_type: string;
          data: string;
        };
      }>;
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

export class GoogleApiService implements ImageGenerationService {
  private config: ApiConfig;
  private baseUrl: string;

  constructor(config: ApiConfig) {
    this.config = config;
    // 确保 baseUrl 格式正确
    let url = config.baseUrl || 'https://generativelanguage.googleapis.com';
    // 移除末尾斜杠
    url = url.replace(/\/+$/, '');
    // 确保包含 /v1beta
    if (!url.includes('/v1beta')) {
      url = url + '/v1beta';
    }
    this.baseUrl = url;
  }

  private getModelName(model?: string): string {
    // Gemini 3 Pro Image 用于高质量图像生成
    // 参考: https://ai.google.dev/gemini-api/docs/gemini-3
    if (model === 'nano-banana-pro') {
      return 'gemini-3-pro-image-preview';
    }
    // 默认使用 Gemini 2.0 Flash (更快，配额更高)
    return 'gemini-2.0-flash-exp';
  }

  async textToImage(request: TextToImageRequest): Promise<GenerateResponse> {
    try {
      // 验证 API Key
      if (!this.config.apiKey || this.config.apiKey.trim() === '') {
        return {
          success: false,
          images: [],
          error: '请先配置 Google API Key',
        };
      }

      const modelName = this.getModelName(request.model);
      const url = `${this.baseUrl}/models/${modelName}:generateContent?key=${this.config.apiKey}`;

      console.log('Requesting URL:', url.replace(this.config.apiKey, '***'));

      // 构建请求体，参考官方文档格式
      const requestBody: Record<string, unknown> = {
        contents: [
          {
            parts: [{ text: request.prompt }],
          },
        ],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      };

      // 添加图像配置（如果指定了宽高比或分辨率）
      if (request.aspectRatio || request.resolution) {
        (requestBody.generationConfig as Record<string, unknown>).imageConfig = {
          aspectRatio: request.aspectRatio || '1:1',
          imageSize: request.resolution || '1K',
        };
      }

      const response = await tauriFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          return {
            success: false,
            images: [],
            error: errorData.error?.message || `API 错误: ${response.status}`,
          };
        } catch {
          return {
            success: false,
            images: [],
            error: `API 错误: ${response.status} - ${response.statusText}`,
          };
        }
      }

      const data: GeminiResponse = await response.json();

      if (data.error) {
        return {
          success: false,
          images: [],
          error: data.error.message,
        };
      }

      const images: string[] = [];

      if (data.candidates) {
        for (const candidate of data.candidates) {
          if (candidate.content?.parts) {
            for (const part of candidate.content.parts) {
              if (part.inline_data) {
                // 将 base64 转换为 data URL
                const dataUrl = `data:${part.inline_data.mime_type};base64,${part.inline_data.data}`;
                images.push(dataUrl);
              }
            }
          }
        }
      }

      if (images.length === 0) {
        return {
          success: false,
          images: [],
          error: '未生成任何图像，请尝试修改提示词',
        };
      }

      return {
        success: true,
        images: images.map(url => createGeneratedImage(url, 'image/png')),
      };
    } catch (error) {
      console.error('Google API text to image error:', error);
      return {
        success: false,
        images: [],
        error: this.formatError(error),
      };
    }
  }

  async imageToImage(request: ImageToImageRequest): Promise<GenerateResponse> {
    try {
      // 验证 API Key
      if (!this.config.apiKey || this.config.apiKey.trim() === '') {
        return {
          success: false,
          images: [],
          error: '请先配置 Google API Key',
        };
      }

      const modelName = this.getModelName(request.model);
      const url = `${this.baseUrl}/models/${modelName}:generateContent?key=${this.config.apiKey}`;

      // 构建包含图片的请求
      const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = [];

      // 添加参考图片
      for (const imageUrl of request.referenceImages) {
        if (imageUrl.startsWith('data:')) {
          const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            parts.push({
              inline_data: {
                mime_type: match[1],
                data: match[2],
              },
            });
          }
        }
      }

      // 添加提示词
      parts.push({ text: request.prompt });

      const response = await tauriFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          return {
            success: false,
            images: [],
            error: errorData.error?.message || `API 错误: ${response.status}`,
          };
        } catch {
          return {
            success: false,
            images: [],
            error: `API 错误: ${response.status} - ${response.statusText}`,
          };
        }
      }

      const data: GeminiResponse = await response.json();

      if (data.error) {
        return {
          success: false,
          images: [],
          error: data.error.message,
        };
      }

      const images: string[] = [];

      if (data.candidates) {
        for (const candidate of data.candidates) {
          if (candidate.content?.parts) {
            for (const part of candidate.content.parts) {
              if (part.inline_data) {
                const dataUrl = `data:${part.inline_data.mime_type};base64,${part.inline_data.data}`;
                images.push(dataUrl);
              }
            }
          }
        }
      }

      if (images.length === 0) {
        return {
          success: false,
          images: [],
          error: '未生成任何图像，请尝试修改提示词',
        };
      }

      return {
        success: true,
        images: images.map(url => createGeneratedImage(url, 'image/png')),
      };
    } catch (error) {
      console.error('Google API image to image error:', error);
      return {
        success: false,
        images: [],
        error: this.formatError(error),
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/models?key=${this.config.apiKey}`;
      const response = await tauriFetch(url);

      if (response.status === 401 || response.status === 403) {
        throw new Error('API Key 无效');
      }

      return response.ok;
    } catch (error) {
      if (error instanceof Error && error.message === 'API Key 无效') {
        throw error;
      }
      throw new Error('网络连接失败');
    }
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return '未知错误';
  }
}
