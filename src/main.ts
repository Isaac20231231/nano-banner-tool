import { createApp } from "vue";
import ElementPlus from "element-plus";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import "element-plus/dist/index.css";

import App from "./App.vue";
import router from "./router";
import { pinia, useAppStore, useApiStore } from "./stores";
import "./styles/index.css";

const app = createApp(App);

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(ElementPlus);
app.use(pinia);
app.use(router);

// 初始化应用
const appStore = useAppStore();
const apiStore = useApiStore();

appStore.init();
apiStore.loadConfigs();

app.mount("#app");
