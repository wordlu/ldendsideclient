import { Result } from './index'
import { Device } from './device'

export interface DirItemType {
  total: number
  rest: number
  name: string
  mnt_path?: string
}

export interface DiskInfoType {
  dir_list: DirItemType[]
}

export interface DataRootDirType {
  data_root_dir: string
  disk_name: string
  rest: number
}

export interface CollectionStatus {
  status: string
  detail: { [detailName: string]: any }
  devices_status: Device[]
  timing_status: string
}

export interface SetCollectionStatusType {
  status: string
  data?: { names: string[] }
}

export interface Settings {
  [keyName: string]: any
}

// 硬盘&目录返回值
export type DiskInfoModel = Result<DiskInfoType>

export type DataRootDirModel = Result<DataRootDirType>

export type CollectionStatusModel = Result<CollectionStatus>

export type SettingsModel = Result<Settings>
