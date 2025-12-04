import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface PromptPreset {
  id: string;
  name: string;
  prompt: string;
  negativePrompt?: string;
  createdAt: number;
  updatedAt: number;
}

// 默认预设提示词
const defaultPresets: Omit<PromptPreset, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: '图片变手办',
    prompt: '将图片中的人物或物品转换成精致的手办模型，保持原有造型特征，呈现光滑的塑料质感和精细的涂装效果',
    negativePrompt: '模糊, 低质量, 变形',
  },
  {
    name: '名人/指定人物超写实生成',
    prompt: '生成超写实风格的人物照片，细节逼真，皮肤纹理清晰，光影自然，8K高清质量',
    negativePrompt: '卡通, 动漫, 模糊, 变形',
  },
  {
    name: '指定人物短视频',
    prompt: '为指定人物生成适合短视频使用的动态感图像，表情生动，构图适合竖屏展示',
    negativePrompt: '静态, 无表情, 模糊',
  },
  {
    name: '建筑图转模型/建模',
    prompt: '将建筑平面图或效果图转换成3D建模风格的渲染图，等距视角，清晰的结构线条，专业的建筑可视化效果',
    negativePrompt: '扭曲, 不对称, 模糊',
  },
  {
    name: '连续编辑 + 物体组合 + 背景设计',
    prompt: '对图像进行多元素组合编辑，融合多个物体并设计协调的背景，保持整体风格统一',
    negativePrompt: '不协调, 拼接感, 色彩不统一',
  },
  {
    name: '高清修复',
    prompt: '对图像进行高清修复和增强，提升分辨率，去除噪点，恢复细节，优化色彩',
    negativePrompt: '模糊, 过度锐化, 失真',
  },
  {
    name: '物体组合/版本对比',
    prompt: '将多个物体或产品进行组合排列，适合做版本对比或产品展示，布局整齐，光影统一',
    negativePrompt: '杂乱, 光影不一致',
  },
  {
    name: '商品广告短片',
    prompt: '生成适合商品广告的高质量产品图，专业的商业摄影风格，突出产品特点，背景简洁高端',
    negativePrompt: '低质量, 业余, 杂乱背景',
  },
  {
    name: '人群中分离指定模糊人物 + 高清生成',
    prompt: '从人群照片中分离出指定人物，将模糊的人物图像高清化重建，保持人物特征和表情',
    negativePrompt: '失真, 变形, 五官错位',
  },
];

const STORAGE_KEY = 'nano-banner-prompt-presets';

export const usePromptPresetsStore = defineStore('promptPresets', () => {
  const presets = ref<PromptPreset[]>([]);
  const selectedPresetId = ref<string | null>(null);

  // 获取当前选中的预设
  const selectedPreset = computed(() => {
    if (!selectedPresetId.value) return null;
    return presets.value.find(p => p.id === selectedPresetId.value) || null;
  });

  // 生成唯一ID
  function generateId(): string {
    return `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 从本地存储加载
  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          presets.value = parsed;
          return;
        }
      }
      // 如果没有保存的数据，使用默认预设
      initDefaultPresets();
    } catch (error) {
      console.error('Failed to load prompt presets:', error);
      initDefaultPresets();
    }
  }

  // 初始化默认预设
  function initDefaultPresets() {
    const now = Date.now();
    presets.value = defaultPresets.map((preset, index) => ({
      ...preset,
      id: generateId(),
      createdAt: now + index,
      updatedAt: now + index,
    }));
    saveToStorage();
  }

  // 保存到本地存储
  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets.value));
    } catch (error) {
      console.error('Failed to save prompt presets:', error);
    }
  }

  // 选择预设
  function selectPreset(id: string | null) {
    selectedPresetId.value = id;
  }

  // 添加预设
  function addPreset(name: string, prompt: string, negativePrompt?: string): PromptPreset {
    const now = Date.now();
    const newPreset: PromptPreset = {
      id: generateId(),
      name,
      prompt,
      negativePrompt,
      createdAt: now,
      updatedAt: now,
    };
    presets.value.push(newPreset);
    saveToStorage();
    return newPreset;
  }

  // 更新预设
  function updatePreset(id: string, updates: Partial<Pick<PromptPreset, 'name' | 'prompt' | 'negativePrompt'>>) {
    const index = presets.value.findIndex(p => p.id === id);
    if (index !== -1) {
      presets.value[index] = {
        ...presets.value[index],
        ...updates,
        updatedAt: Date.now(),
      };
      saveToStorage();
    }
  }

  // 删除预设
  function deletePreset(id: string) {
    const index = presets.value.findIndex(p => p.id === id);
    if (index !== -1) {
      presets.value.splice(index, 1);
      if (selectedPresetId.value === id) {
        selectedPresetId.value = null;
      }
      saveToStorage();
    }
  }

  // 重置为默认预设
  function resetToDefault() {
    initDefaultPresets();
    selectedPresetId.value = null;
  }

  // 初始化时加载数据
  loadFromStorage();

  return {
    presets,
    selectedPresetId,
    selectedPreset,
    selectPreset,
    addPreset,
    updatePreset,
    deletePreset,
    resetToDefault,
    loadFromStorage,
  };
});
