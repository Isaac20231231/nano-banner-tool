import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  TextToImageRequest,
  ImageToImageRequest,
  GeneratedImage,
  GenerationTask,
  AspectRatio,
  Resolution,
  OutputFormat,
  ModelType,
} from '@/types';

export const useGenerationStore = defineStore('generation', () => {
  // 当前生成参数
  const prompt = ref('');
  const negativePrompt = ref('');
  const model = ref<ModelType>('nano-banana-pro');
  const numImages = ref(1);
  const aspectRatio = ref<AspectRatio>('1:1');
  const resolution = ref<Resolution>('1K');
  const outputFormat = ref<OutputFormat>('png');
  const seed = ref<number | undefined>(undefined);
  const referenceImages = ref<string[]>([]);

  // 生成状态
  const isGenerating = ref(false);
  const progress = ref(0);
  const currentTask = ref<GenerationTask | null>(null);
  const generatedImages = ref<GeneratedImage[]>([]);
  const error = ref<string | null>(null);

  // 历史记录
  const history = ref<GenerationTask[]>([]);

  // 计算属性
  const canGenerate = computed(() => {
    return prompt.value.trim().length > 0 && !isGenerating.value;
  });

  const hasReferenceImages = computed(() => {
    return referenceImages.value.length > 0;
  });

  // 方法
  function setPrompt(value: string) {
    prompt.value = value;
  }

  function setNegativePrompt(value: string) {
    negativePrompt.value = value;
  }

  function setModel(value: ModelType) {
    model.value = value;
  }

  function setNumImages(value: number) {
    numImages.value = Math.min(Math.max(value, 1), 4);
  }

  function setAspectRatio(value: AspectRatio) {
    aspectRatio.value = value;
  }

  function setResolution(value: Resolution) {
    resolution.value = value;
  }

  function setOutputFormat(value: OutputFormat) {
    outputFormat.value = value;
  }

  function setSeed(value: number | undefined) {
    seed.value = value;
  }

  function addReferenceImage(imageUrl: string) {
    if (referenceImages.value.length < 14) {
      referenceImages.value.push(imageUrl);
    }
  }

  function removeReferenceImage(index: number) {
    referenceImages.value.splice(index, 1);
  }

  function clearReferenceImages() {
    referenceImages.value = [];
  }

  function getTextToImageRequest(): TextToImageRequest {
    return {
      prompt: prompt.value,
      negativePrompt: negativePrompt.value || undefined,
      numImages: numImages.value,
      aspectRatio: aspectRatio.value,
      resolution: resolution.value,
      outputFormat: outputFormat.value,
      seed: seed.value,
      model: model.value,
    };
  }

  function getImageToImageRequest(): ImageToImageRequest {
    return {
      ...getTextToImageRequest(),
      referenceImages: referenceImages.value,
    };
  }

  function startGeneration() {
    isGenerating.value = true;
    progress.value = 0;
    error.value = null;
  }

  function updateProgress(value: number) {
    progress.value = value;
  }

  function completeGeneration(images: GeneratedImage[]) {
    generatedImages.value = images;
    isGenerating.value = false;
    progress.value = 100;
  }

  function failGeneration(errorMessage: string) {
    error.value = errorMessage;
    isGenerating.value = false;
    progress.value = 0;
  }

  function clearResults() {
    generatedImages.value = [];
    error.value = null;
    progress.value = 0;
  }

  function resetForm() {
    prompt.value = '';
    negativePrompt.value = '';
    numImages.value = 1;
    seed.value = undefined;
    referenceImages.value = [];
    clearResults();
  }

  return {
    // 状态
    prompt,
    negativePrompt,
    model,
    numImages,
    aspectRatio,
    resolution,
    outputFormat,
    seed,
    referenceImages,
    isGenerating,
    progress,
    currentTask,
    generatedImages,
    error,
    history,
    // 计算属性
    canGenerate,
    hasReferenceImages,
    // 方法
    setPrompt,
    setNegativePrompt,
    setModel,
    setNumImages,
    setAspectRatio,
    setResolution,
    setOutputFormat,
    setSeed,
    addReferenceImage,
    removeReferenceImage,
    clearReferenceImages,
    getTextToImageRequest,
    getImageToImageRequest,
    startGeneration,
    updateProgress,
    completeGeneration,
    failGeneration,
    clearResults,
    resetForm,
  };
});
