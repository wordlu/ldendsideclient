import type { I18n, I18nOptions } from 'vue-i18n'
import { createI18n } from 'vue-i18n'

async function createI18nOptions(): Promise<I18nOptions> {
  const locale = localStorage.getItem('lang') || 'zh-CN' // 获取本地语言
  const defaultLocal = await import(`@/locales/langs/${locale}.ts`) // 加载语言入口文件
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

// 通用方法
import { i18nInstance } from '@/locales'

let t = (i18nInstance?.global as any)?.t
if (!t) {
  const i18n = await createI18nInstance()
  t = i18n.global.t
}

// 设置图片上传url
let baseUrl = ''
export let uploadUrl = ''
function setUploadUrl() {
  const envParam = import.meta.env
  baseUrl =
    'http://' +
    (envParam.PROD ? location.hostname + envParam.VITE_BASE_URL : envParam.VITE_BASE_URL)

  uploadUrl = baseUrl + '/api/s1/v1/image/'
}
!uploadUrl && setUploadUrl()

// 英文输入的校验正则,支持数字字母下划线组合,数字不能放在首位
export const enNameReg = /^[a-zA-Z_][0-9a-zA-Z_]{0,}$/

// ip校验正则
export const ipReg =
  /^((\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/

// 数字最大限制
export const numberLimit = 99999999

// 每种设备类型固定的字段
export const deviceFixedParams = [
  { name: t('device.type'), keyName: '' }, // 设备类型名
  { name: t('device.name'), keyName: 'name' }, // 设备名称
  { name: t('device.relDataDir'), keyName: 'rel_data_dir' }, // 相对数据路径
  { name: t('device.maxFrame'), keyName: 'frame_num_per_file' }, // 单包最大采集帧数
  { name: t('device.description'), keyName: 'description' }, // 设备描述
  { name: t('device.details'), keyName: 'details' }, // 设备详述
  { name: t('common.enable'), keyName: 'enable' }, // 使能
]

export const imgUrl = (url: string) => {
  // return `http://10.86.24.20:8100/${url}`
  return `${baseUrl}/${url}`
}
