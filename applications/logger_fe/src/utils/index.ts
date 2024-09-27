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

import { Vector3 } from 'three'
// import { RegionBoxParamType } from '@/store/types/region_stat'
import { i18nInstance } from '@/locales'

let t = (i18nInstance?.global as any)?.t
if (!t) {
  const i18n = await createI18nInstance()
  t = i18n.global.t
}
/**
 * 去抖函数。
 *
 * 将函数封装到一个延迟执行的定时器回调中，如果在定时器触发前执行多次，会自动取消之前的调用。
 * @param {Callable} fn 可调用对象。
 * @param {Number} delay 调用的延迟时间。
 * @returns 延迟调用的函数。
 */
export function debounce(fn: () => void, delay: number) {
  // 通过闭包缓存一个定时器 id
  let timer: number | null = null
  // 将 debounce 处理结果当作函数返回
  // 触发事件回调时执行这个返回函数
  return function (...args: any) {
    // 如果已经设定过定时器就清空上一次的定时器
    if (timer) clearTimeout(timer)

    // 开始设定一个新的定时器，定时器结束后执行传入的函数 fn
    timer = window.setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      fn.apply(this, args)
    }, delay)
  }
}

// 判断本地浏览器的大小端
export const isBigEndian = (() => {
  const array = new Uint8Array(4)
  const view = new Uint32Array(array.buffer)
  return !((view[0] = 1) & array[0])
})()

/**
 * 生成一个随机颜色
 */
export function getRandomColor() {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

/**
 * 是否统计矩形框的点
 * @param {{x: number, y: number, z: number}} tempV3 统计的点
 * @param {Array<{xMin: number, xMax: number, yMin: number, yMax: number, zMin: number, zMax: number, visible: boolean, statistics: boolean}>} boxList 统计的区域选择框
 * @return true 如果这个点在这些矩形框里 否则返回 false
 */
//  RegionBoxParamType[]
export function statisticalData(tempV3: Vector3, boxList: any[]) {
  let inRegion = false
  for (let i = 0; i < boxList.length; i++) {
    if (!boxList[i].visible) {
      continue
    }
    if (boxList[i].statistics) {
      if (inRegion) {
        continue
      }
      if (
        tempV3.x >= boxList[i].xMin &&
        tempV3.x <= boxList[i].xMax &&
        tempV3.y >= boxList[i].yMin &&
        tempV3.y <= boxList[i].yMax &&
        tempV3.z >= boxList[i].zMin &&
        tempV3.z <= boxList[i].zMax
      ) {
        inRegion = true
      }
    } else {
      if (
        tempV3.x >= boxList[i].xMin &&
        tempV3.x <= boxList[i].xMax &&
        tempV3.y >= boxList[i].yMin &&
        tempV3.y <= boxList[i].yMax &&
        tempV3.z >= boxList[i].zMin &&
        tempV3.z <= boxList[i].zMax
      ) {
        return false
      }
    }
  }
  return inRegion
}

/** 计算数组的标准差 */
export function calStdev(myArr: number[]) {
  const n = myArr.length
  const mean = myArr.reduce((a, b) => a + b) / n
  return Math.sqrt(myArr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
}

// 获取浏览器缓存的值
export function getLocalStorage(key: string) {
  if (!key) return null
  const valueString = localStorage.getItem(key)
  if (valueString === 'undefined' || valueString === null) return null
  try {
    return JSON.parse(valueString)
  } catch {
    return valueString
  }
}

/**
 * 生成下载文件.
 * @param content 文件内容.
 * @param fileName 文件名.
 * @param contentType 文件类型.
 */
export function downloadFile(content: string, fileName: string, contentType = 'text/plain') {
  const a = document.createElement('a')
  const file = new Blob([content], { type: contentType })
  a.href = URL.createObjectURL(file)
  a.download = fileName
  a.click()
}

/**
 * 封装监控里的错误等级信息
 * @param detail 监控详情数据
 * @returns 返回封装后的监控详情
 */
export function formatMonitorData(detail) {
  ;(detail.dir_speed_log || []).forEach(i => {
    i.ts_offset = i.lidar_award_time_result?.ts_offset
    // 值以level_value的形式拼接而成,需要解析成level+value的形式,当level为error和critical时字段标红显示
    ;['transmission_wave_rate', 'ts_offset'].forEach(v => {
      const s_v = splitLevelValue(i[v])
      i[v] = {
        level: s_v[0],
        value: s_v[1],
      }
    })
  })
  // 磁盘监控
  const free_space = detail.disk_log.free_space
  // 工控机授时监控
  const timing = detail.timing_log.ts_offset
  const s_v = splitLevelValue(free_space)
  const t_v = splitLevelValue(timing)
  detail.disk_log.free_space = {
    // isError: ['error', 'critical', 'warning'].indexOf(s_v[0]) > -1,
    level: s_v[0],
    value: s_v[1],
  }
  if (typeof detail.timing_log !== 'string') {
    detail.timing_log.ts_offset = {
      // isError: ['error', 'critical', 'warning'].indexOf(t_v[0]) > -1,
      level: t_v[0],
      value: t_v[1] + 'ms',
    }
  }
  return detail
}

function splitLevelValue(value: string) {
  if (!value) return ['info', value || '--']
  const comb = value.split('_')
  if (comb.length === 2) {
    return comb
  }
  return ['info', value]
}

export const menuList = [
  {
    index: '/loggerfe/root/index',
    icon: 'fluent:gather-20-regular',
    name: t('common.collect'),
  },
  {
    index: '/loggerfe/root/visualization',
    icon: 'dashicons:welcome-view-site',
    name: t('common.visualization'),
  },
  {
    index: 'system',
    name: t('common.sysManage'),
    icon: 'ant-design:setting-filled',
    children: [
      {
        index: '/loggerfe/root/system_manage',
        icon: '',
        name: t('common.sysConfig'),
      },
      {
        index: '/loggerfe/root/device_registed',
        icon: '',
        name: t('common.deviceRegst'),
      },
      {
        index: 'lidar',
        name: t('common.lidarCfg'),
        children: [
          { index: '/loggerfe/root/lidar_index', name: t('common.config') },
          { index: '/loggerfe/root/lidar_info', name: t('common.overview') },
        ],
      },
      {
        index: 'camera',
        name: t('common.cameraCfg'),
        children: [
          { index: '/loggerfe/root/camera_index', name: t('common.config') },
          { index: '/loggerfe/root/camera_info', name: t('common.overview') },
        ],
      },
      {
        index: 'can',
        name: t('common.canCfg'),
        children: [
          { index: '/loggerfe/root/can_index', name: t('common.config') },
          { index: '/loggerfe/root/can_info', name: t('common.overview') },
        ],
      },
      {
        index: '/loggerfe/root/com_index',
        name: t('common.comCfg'),
      },
      {
        index: '/loggerfe/root/tag_index',
        name: t('common.tagCfg'),
      },
      // 自动打标功能前后端已完成联调,目前这个功能不要了
      // {
      //   index: '/tag_auto',
      //   name: t('common.tagAuto'),
      // },
      { index: '/loggerfe/root/system_info', name: t('common.systemInfo') },
    ],
  },
  {
    index: '/loggerfe/root/aboutnative',
    icon: 'ant-design:deployment-unit-outlined',
    name: t('common.native'),
  },
]
