import { TagData } from '@/api/s1/model/tag'

export enum CollectStatusMap {
  stop = 0,
  initialize = 0,
  check = 1,
  connect = 2,
  push_data = 3,
  collect = 4,
  push_and_collect = 5,
  pause = 6,
  warning = -1,
  error = -2,
  fatal_error = -3,
}

export interface DeviceType {
  id?: number
  name?: string
  device_type_id?: number
  device_type_name?: string
  config?: {
    [configName: string]: any
  }
  description?: string
  detail?: string
  rel_data_dir?: string
  enable?: boolean
  device_status?: string
  device_status_detail?: null
  [deviceName: string]: any
}
export interface Collect {
  collectStatus: string
  triggerInCollecting: boolean
  deviceConfig: DeviceType[]
  timingDetail: {
    status?: string
  }
  tagging_cache: number[]
  latestTag: TagData
  isFullScreen: boolean
  collecting_mode: string
}
