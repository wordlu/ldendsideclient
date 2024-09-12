import { Result } from './index'

export interface DirItemType {
  total: number
  rest: number
  name: string
}

export interface ConfigTemplate {
  name: {
    en: string
    zhCn: string
  }
  value_name: string
  type: string
  description?: {
    en: string
    zhCn: string
  }
  value: any
  verify?: {
    type?: string
    format_reg?: any
    maxValue?: number
    minValue?: number
  }
  required: boolean
}
export interface DeviceType {
  id: number
  name: string
  category: string
  register_status: string
  config_template?: ConfigTemplate[]
  default_config: null
  description: null
  detail: null
  img: string
  timing_mode: string
  device_type_name: string
  img_url: string
}

export type DeviceTypeModel = Result<DeviceType>

export type DeviceTypeListModel = Result<{ count: number; results: DeviceType[] }>

export interface Device {
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

export type DeviceModel = Result<Device>

export type DeviceListModel = Result<Device[]>
