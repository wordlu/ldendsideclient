import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import Vue3DraggableResizable from 'vue3-draggable-resizable';
import 'element-plus/theme-chalk/index.css'
import ElementPlus from 'element-plus'
import i18n from './lang'
//default styles
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css';

const pinia = createPinia();
const app = createApp(App);
app.use(router).use(pinia).use(i18n).use(ElementPlus).use(Vue3DraggableResizable).mount('#app');