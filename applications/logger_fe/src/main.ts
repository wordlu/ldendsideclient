import i18n from '@/locales'
import { createApp } from 'vue'
import 'element-plus/dist/index.css'
import './style.scss'
import App from './App.vue'
import router from './router'
import { store } from './store'
import '@/assets/icons'

async function render() {
  const app = createApp(App)
  app.use(router)
  app.use(store)
  await i18n(app)
  app.mount('#loggerfe')
}

if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

export async function bootstrap() {
  console.log('Vite sub-app bootstraped');
}

export async function mount(props: any) {
  render();
}

export async function unmount() {
  if (app) {
    app.unmount();
    app = null;
  }
}
// init()

