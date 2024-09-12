import { App } from 'vue'
import type { I18n, I18nOptions } from 'vue-i18n'
import { createI18n } from 'vue-i18n'

async function createI18nOptions(): Promise<I18nOptions> {
  const locale = localStorage.getItem('lang') || 'zh-CN' // 获取本地语言
  const defaultLocal = await import(`./langs/${locale}.ts`) // 加载语言入口文件
  const message = defaultLocal.default ?? {} // 获取到语言翻译内容

  return {
    locale,
    messages: {
      [locale]: message,
    },
    fallbackLocale: 'en',
    legacy: false, // you must set `false`, to use Composition API
  }
}

export const createI18nInstance = async () => {
  const options = await createI18nOptions()
  return createI18n(options) as I18n
}

export let i18nInstance: I18n | null = null

export default async function (app: App) {
  const i18n = await createI18nInstance()
  i18nInstance = i18n
  app.use(i18n)
}
