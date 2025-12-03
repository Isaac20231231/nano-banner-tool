<template>
  <div class="about-page">
    <div class="about-header">
      <img src="@/assets/logo.svg" alt="Logo" class="app-logo" />
      <h1>Nano Banner Tool</h1>
      <p class="version">版本 0.1.0</p>
    </div>

    <div class="about-content">
      <p>
        Nano Banner Tool 是一款基于 Nano Banana 2 (Google Gemini) 的 AI 图像生成工具，
        支持文生图和图生图功能。
      </p>

      <div class="info-section">
        <h3>技术栈</h3>
        <ul>
          <li>Tauri 2.0 - 跨平台桌面框架</li>
          <li>Vue 3 + TypeScript - 前端框架</li>
          <li>Element Plus - UI 组件库</li>
          <li>Nano Banana 2 API - AI 图像生成</li>
        </ul>
      </div>

      <div class="info-section">
        <h3>相关链接</h3>
        <ul>
          <li>
            <a href="https://fal.ai/models/fal-ai/nano-banana-pro" target="_blank">
              Nano Banana Pro API
            </a>
          </li>
          <li>
            <a href="https://ai.google.dev/gemini-api/docs/image-generation" target="_blank">
              Gemini Image Generation
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="about-footer">
      <p>&copy; 2024 Isaac. All rights reserved.</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.about-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.about-header {
  margin-bottom: 32px;

  .app-logo {
    width: 80px;
    height: 80px;
    margin-bottom: 16px;
  }

  h1 {
    font-size: 28px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .version {
    color: var(--text-secondary);
  }
}

.about-content {
  max-width: 500px;
  text-align: left;

  > p {
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 24px;
  }

  .info-section {
    margin-bottom: 24px;

    h3 {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 12px;
    }

    ul {
      list-style: none;
      padding: 0;

      li {
        padding: 8px 0;
        color: var(--text-secondary);
        border-bottom: 1px solid var(--border-color);

        &:last-child {
          border-bottom: none;
        }

        a {
          color: var(--primary-color);
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
}

.about-footer {
  margin-top: 32px;
  color: var(--text-secondary);
  font-size: 13px;
}
</style>
