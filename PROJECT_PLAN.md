# Nano Banana 2 图像生成工具 - 项目方案

## 项目概述

开发一款跨平台（Windows/macOS）桌面应用，集成 Nano Banana 2（基于 Google Gemini）AI 模型，提供专业级图像生成与编辑功能。

---

## 技术选型

### 框架方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **Electron + Vue 3** | 生态成熟、跨平台稳定、开发效率高 | 包体积较大(~150MB) | ⭐⭐⭐⭐⭐ |
| **Tauri + Vue 3** | 包体积小(~10MB)、性能好、安全性高 | 生态较新、部分功能需 Rust 开发 | ⭐⭐⭐⭐ |
| **Flutter Desktop** | 一套代码多端、UI 流畅 | 桌面端成熟度一般 | ⭐⭐⭐ |

### 推荐方案：Tauri 2.0 + Vue 3 + TypeScript

**理由：**
1. 包体积小，用户体验好
2. 原生性能，图像处理流畅
3. 内存占用低
4. 安全性更高（Rust 后端）
5. Vue 3 + Vite 开发体验优秀

### 技术栈详情

```
前端框架：Vue 3 + TypeScript + Vite
UI 组件库：Element Plus / Naive UI
状态管理：Pinia
样式方案：TailwindCSS + SCSS
桌面框架：Tauri 2.0
图像处理：Sharp (Node) / image-rs (Rust)
API 通信：Axios / Fetch API
本地存储：SQLite (via Tauri)
```

---

## 功能模块设计

### 1. 主页面布局

```
┌─────────────────────────────────────────────────────────────┐
│  顶部导航栏 [Logo] [文生图] [图生图] [历史记录] [设置] [用户] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌─────────────────────────────────┐  │
│  │                  │  │                                 │  │
│  │   左侧控制面板    │  │         右侧预览区域            │  │
│  │                  │  │                                 │  │
│  │  - 提示词输入     │  │    生成结果 / 参考图预览         │  │
│  │  - 参数设置       │  │                                 │  │
│  │  - 参考图上传     │  │    支持缩放、对比、下载          │  │
│  │  - 生成按钮       │  │                                 │  │
│  │                  │  │                                 │  │
│  └──────────────────┘  └─────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  底部状态栏 [API状态] [生成进度] [积分余额] [版本信息]        │
└─────────────────────────────────────────────────────────────┘
```

### 2. 功能模块详情

#### 2.1 提示词模块 (Prompt Module)
- **主提示词输入框**：支持多行、字数统计（3-50000字符）
- **负面提示词**：排除不想要的元素
- **提示词模板库**：预设常用风格模板
- **提示词增强器**：AI 辅助优化提示词
- **历史提示词**：快速复用之前的提示词
- **多语言支持**：自动翻译为英文（可选）

#### 2.2 AI 参数设置模块 (Settings Module)
- **模型选择**
  - Nano Banana (Gemini 2.5 Flash) - 快速
  - Nano Banana Pro (Gemini 3 Pro) - 高质量

- **生成参数**
  - 图片数量：1-4 张
  - 分辨率：1K / 2K / 4K
  - 宽高比：1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9, 21:9
  - 输出格式：PNG / JPEG / WebP

- **高级参数**
  - 采样步数 (Steps)
  - CFG Scale（引导强度）
  - 随机种子 (Seed)
  - 风格权重

#### 2.3 参考图模块 (Reference Image Module)
- **图片上传**
  - 拖拽上传
  - 点击选择
  - 粘贴图片
  - URL 导入

- **支持格式**：PNG, JPEG, JPG, WebP, HEIC
- **多图参考**：最多 14 张参考图（Gemini 3 Pro）
- **图片预处理**
  - 裁剪
  - 旋转
  - 缩放
  - 滤镜预览

- **参考模式**
  - 风格参考
  - 内容参考
  - 姿势参考
  - 角色一致性

#### 2.4 API 配置模块 (API Config Module)
- **API 提供商选择**
  - fal.ai
  - Google AI Studio
  - 其他代理服务

- **配置项**
  - API Key 管理（加密存储）
  - API Base URL
  - 代理设置（HTTP/SOCKS5）
  - 超时时间
  - 重试策略

- **费用统计**
  - 单次生成费用预估
  - 历史消费统计
  - 余额查询

#### 2.5 生成结果模块 (Output Module)
- **实时预览**
  - 生成进度条
  - 中间状态预览（Gemini 3 Pro 思考过程）

- **结果展示**
  - 多图网格视图
  - 单图大图预览
  - 图片对比（生成前后）
  - 元数据显示

- **操作功能**
  - 下载（单张/批量）
  - 收藏
  - 分享
  - 继续编辑
  - 变体生成
  - 高清放大

### 3. 扩展功能模块

#### 3.1 历史记录中心
- 生成历史浏览
- 按日期/模型/标签筛选
- 批量管理
- 导出/导入

#### 3.2 工作流/批处理
- 批量生成任务队列
- 定时任务
- 模板工作流

#### 3.3 本地素材库
- 图片资源管理
- 标签分类
- 智能搜索

#### 3.4 社区功能（可选）
- 作品分享
- 提示词市场
- 风格预设共享

---

## 页面结构

```
src/
├── views/
│   ├── Home/                    # 主页（快速生成）
│   │   ├── index.vue
│   │   ├── components/
│   │   │   ├── PromptInput.vue      # 提示词输入
│   │   │   ├── ParameterPanel.vue   # 参数面板
│   │   │   ├── ReferenceUpload.vue  # 参考图上传
│   │   │   ├── GenerateButton.vue   # 生成按钮
│   │   │   └── ResultPreview.vue    # 结果预览
│   │   └── hooks/
│   │
│   ├── TextToImage/             # 文生图专业模式
│   │   └── index.vue
│   │
│   ├── ImageToImage/            # 图生图/编辑模式
│   │   └── index.vue
│   │
│   ├── History/                 # 历史记录
│   │   └── index.vue
│   │
│   ├── Gallery/                 # 素材库
│   │   └── index.vue
│   │
│   ├── Batch/                   # 批量处理
│   │   └── index.vue
│   │
│   └── Settings/                # 设置页面
│       ├── index.vue
│       ├── ApiConfig.vue        # API 配置
│       ├── ModelConfig.vue      # 模型配置
│       ├── StorageConfig.vue    # 存储配置
│       ├── AppearanceConfig.vue # 外观设置
│       └── AboutPage.vue        # 关于页面
│
├── components/                  # 全局组件
│   ├── common/
│   │   ├── ImageViewer.vue      # 图片查看器
│   │   ├── ProgressBar.vue      # 进度条
│   │   └── LoadingMask.vue      # 加载遮罩
│   │
│   ├── prompt/
│   │   ├── PromptEditor.vue     # 提示词编辑器
│   │   ├── PromptTemplate.vue   # 提示词模板
│   │   └── PromptHistory.vue    # 提示词历史
│   │
│   └── image/
│       ├── ImageUploader.vue    # 图片上传器
│       ├── ImageCropper.vue     # 图片裁剪
│       └── ImageCompare.vue     # 图片对比
│
├── layouts/
│   ├── MainLayout.vue           # 主布局
│   └── SettingsLayout.vue       # 设置页布局
│
└── router/
    └── index.ts
```

---

## API 集成设计

### 支持的 API 提供商

#### 1. fal.ai (推荐)
```typescript
interface FalConfig {
  apiKey: string;
  baseUrl: string; // https://fal.run
  model: 'fal-ai/nano-banana' | 'fal-ai/nano-banana-pro';
}

// 文生图请求
interface TextToImageRequest {
  prompt: string;
  num_images?: number;        // 1-4
  aspect_ratio?: AspectRatio;
  resolution?: '1K' | '2K' | '4K';
  output_format?: 'png' | 'jpeg' | 'webp';
  sync_mode?: boolean;
}

// 图生图请求
interface ImageToImageRequest extends TextToImageRequest {
  image_urls: string[];       // 参考图 URL 数组
}

// 响应格式
interface GenerateResponse {
  images: Array<{
    url: string;
    content_type: string;
    file_name: string;
  }>;
  description?: string;
}
```

#### 2. Google AI Studio (直连)
```typescript
interface GoogleAIConfig {
  apiKey: string;
  model: 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview';
}

// 使用 Gemini SDK
interface GenerateContentRequest {
  contents: Content[];
  generationConfig: {
    response_modalities: ['TEXT', 'IMAGE'];
    image_config: {
      aspect_ratio: string;
      image_size: '1K' | '2K' | '4K';
    };
  };
}
```

### API 服务层架构

```typescript
// src/services/api/index.ts
export interface ImageGenerationService {
  textToImage(request: TextToImageRequest): Promise<GenerateResponse>;
  imageToImage(request: ImageToImageRequest): Promise<GenerateResponse>;
  checkBalance(): Promise<BalanceInfo>;
  cancelTask(taskId: string): Promise<void>;
}

// 工厂模式支持多提供商
export function createApiService(provider: ApiProvider): ImageGenerationService {
  switch (provider) {
    case 'fal':
      return new FalApiService();
    case 'google':
      return new GoogleApiService();
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
```

---

## 数据存储设计

### 本地数据库 (SQLite)

```sql
-- 生成历史表
CREATE TABLE generation_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  model TEXT NOT NULL,
  parameters JSON NOT NULL,
  reference_images JSON,
  output_images JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  tags TEXT,
  favorite INTEGER DEFAULT 0
);

-- 提示词模板表
CREATE TABLE prompt_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT,
  prompt TEXT NOT NULL,
  preview_image TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- API 配置表（加密存储）
CREATE TABLE api_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL UNIQUE,
  api_key_encrypted TEXT NOT NULL,
  base_url TEXT,
  settings JSON,
  is_active INTEGER DEFAULT 0
);

-- 素材库表
CREATE TABLE gallery_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_path TEXT NOT NULL,
  thumbnail_path TEXT,
  tags TEXT,
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 文件存储结构

```
~/.nano-banana-tool/
├── config/
│   └── settings.json        # 应用配置
├── database/
│   └── app.db              # SQLite 数据库
├── cache/
│   ├── thumbnails/         # 缩略图缓存
│   └── temp/               # 临时文件
├── output/
│   └── {date}/             # 按日期组织的生成结果
└── gallery/
    └── imports/            # 导入的素材
```

---

## 项目结构

```
nano-banana-tool/
├── src/                        # 前端源码 (Vue)
│   ├── assets/                 # 静态资源
│   ├── components/             # Vue 组件
│   ├── views/                  # 页面视图
│   ├── router/                 # 路由配置
│   ├── stores/                 # Pinia 状态管理
│   ├── services/               # API 服务层
│   ├── utils/                  # 工具函数
│   ├── hooks/                  # 组合式函数
│   ├── types/                  # TypeScript 类型
│   ├── locales/                # 国际化文件
│   ├── App.vue
│   └── main.ts
│
├── src-tauri/                  # Tauri 后端 (Rust)
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands/           # Tauri 命令
│   │   ├── database/           # 数据库操作
│   │   ├── crypto/             # 加密模块
│   │   └── utils/
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── public/                     # 公共资源
├── tests/                      # 测试文件
├── scripts/                    # 构建脚本
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## 开发计划

### Phase 1: 基础架构 (核心功能)
- [ ] 项目初始化（Tauri + Vue 3 + TypeScript）
- [ ] UI 框架搭建（布局、主题）
- [ ] API 服务层封装（fal.ai）
- [ ] 基础文生图功能
- [ ] 本地存储实现

### Phase 2: 核心功能完善
- [ ] 图生图/编辑功能
- [ ] 参考图上传与处理
- [ ] 参数面板完整实现
- [ ] 生成历史记录
- [ ] 多 API 提供商支持

### Phase 3: 增强功能
- [ ] 提示词模板库
- [ ] 批量处理
- [ ] 素材库管理
- [ ] 图片后处理工具

### Phase 4: 优化与发布
- [ ] 性能优化
- [ ] 多语言支持
- [ ] 自动更新
- [ ] 打包发布（Windows/macOS）

---

## 技术难点与解决方案

| 难点 | 解决方案 |
|------|----------|
| API Key 安全存储 | 使用系统密钥链 + AES 加密 |
| 大图片处理性能 | Rust 侧处理 + Web Worker |
| 跨平台文件路径 | Tauri Path API 统一处理 |
| 网络代理支持 | Tauri HTTP 插件 + 系统代理检测 |
| 生成进度实时更新 | SSE/WebSocket + 状态轮询 |
| 图片本地缓存策略 | LRU 缓存 + 磁盘空间管理 |

---

## 预估资源

- **开发工具**：VS Code, Rust Analyzer, Vue DevTools
- **图标资源**：自制或使用开源图标库
- **测试账号**：fal.ai / Google AI Studio API Key

---

## 备选方案

如果 Tauri 方案遇到困难，可快速切换至 Electron 方案：
- 核心前端代码可完全复用
- 仅需替换 Tauri 命令为 Electron IPC
- 打包工具改用 electron-builder

---

*文档版本：v1.0*
*创建日期：2024-12-03*
