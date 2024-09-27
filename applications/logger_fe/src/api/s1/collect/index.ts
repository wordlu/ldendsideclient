// 采集相关的http定义
import defHttp from '@/utils/http'
import {
  DataRootDirModel,
  DiskInfoModel,
  CollectionStatusModel,
  SetCollectionStatusType,
  SettingsModel,
} from '../model/collect'
// import '@/mock'

const modelUrl = '/api/s1/v1'

enum Api {
  DataRootDir = '/data_root_dir/', // 获取数据存储位置
  DiskInfo = '/disk_info/', // 获取硬盘&目录信息
  CollectionStatus = '/collection_status/', // 获取采集状态
  ManualOperaRecord = '/manual_opera_record/', // 监控错误状态下记录用户操作
  MonitorStatus = '/monitor_status/', // 获取监控状态
  Settings = '/settings/', // 系统通用设置
}

/**
 * @description: 数据存储位置相关
 */
export const getDataRootDir = () => {
  return defHttp.get<DataRootDirModel>({ url: modelUrl + Api.DataRootDir })
}

/**
 * 设置数据存储路径
 * @param data 存储位置&硬盘名称
 * @returns
 */
export const setDataRootDir = (data: { data_root_dir: string; disk_name: string }) => {
  return defHttp.post<DataRootDirModel>({ url: modelUrl + Api.DataRootDir, data })
}

/**
 * 获取硬盘信息,或者指定文件夹下的子目录
 * @param dir 获取指定目录下的子目录,不存在时获取硬盘信息
 * @returns
 */
export const getDiskInfo = (dir?: string) => {
  // 不存在dir参数时,获取硬盘
  if (!dir) return defHttp.get<DiskInfoModel>({ url: modelUrl + Api.DiskInfo })
  return defHttp.get<DiskInfoModel>({ url: modelUrl + Api.DiskInfo, params: { dir: dir } })
}

// 获取采集状态
export const getCollectionStatus = () => {
  return defHttp.get<CollectionStatusModel>({ url: modelUrl + Api.CollectionStatus })
}

// 设置采集状态
export const setCollectionStatus = (data: SetCollectionStatusType) => {
  return defHttp.post<DiskInfoModel>({ url: modelUrl + Api.CollectionStatus, data })
}
/**
 * 获取监控状态
 */
export const getMonitorStatus = () => {
  return defHttp.get({ url: modelUrl + Api.MonitorStatus })
}

// 监控错误状态下记录用户操作
export const recordManualOpera = (manual_operation: string) => {
  return defHttp.post<any>({ url: modelUrl + Api.ManualOperaRecord, data: { manual_operation } })
}

/**
 *
 * @returns 获取系统通用设置
 */
export const getSettings = () => {
  const params = new URLSearchParams()
  params.append('queries', 'collecting_mode')
  params.append('queries', 'tagging_duration')
  return defHttp.get<SettingsModel>({
    url: modelUrl + Api.Settings,
    params: {
      queries: 'collecting_mode,tagging_duration',
    },
  })
}

/**
 * 设置系统通用设置
 */
export const setSettings = (data: any) => {
  return defHttp.post<SettingsModel>({ url: modelUrl + Api.Settings, data })
}
