// 定义设备配置相关的请求
// import '@/mock'

// 采集相关的http定义
import defHttp from '@/utils/http'
import { DeviceTypeListModel, DeviceTypeModel, DeviceModel, DeviceListModel } from '../model/device'
import { DeleteModel } from '../model/tag'

const modelUrl = '/api/s1/v1'

enum Api {
  DeviceType = '/device_type/', // 获取设备类型
  Device = '/device/', // 设备请求地址
}

/**
 * @description: 获取全部/指定种类(雷达|相机等)的设备类型
 */
export const getDeviceType = (params: { category?: string; page_size?: number; page?: number }) => {
  return defHttp.get<DeviceTypeListModel>({
    url: modelUrl + Api.DeviceType,
    params: {
      category: params.category,
      page_size: params.page_size || 999999,
      page: params.page || 1,
    },
  })
}

/**
 * @description: 获取指定类型的设备
 * @params device_type_id-获取指定类型的设备,id=获取指定设备
 */
export const getDeviceTypeById = (device_type_id?: number) => {
  return defHttp.get<DeviceTypeModel>({
    url: modelUrl + Api.DeviceType + (!device_type_id ? '' : device_type_id + '/'),
  })
}

/**
 * 更新设备类型
 * @param data
 * @returns
 */
export const updateDeviceType = (data: any) => {
  if (data.id) {
    return defHttp.put({ url: modelUrl + Api.DeviceType + data.id + '/', data })
  }
  // return defHttp.post({})
}

/**
 * @description 删除指定id的设备类型
 */
export const deleteDeviceType = (id: number) => {
  return defHttp.delete<DeleteModel>({
    url: modelUrl + Api.DeviceType + id + '/',
  })
}

/**
 * @description 根据指定id获取设备详情
 */
export const getDeviceById = (id?: number) => {
  return defHttp.get<DeviceModel>({
    url: modelUrl + Api.Device + (!id ? '' : id + '/'),
  })
}
/**
 * @description 根据全部设备或者指定种类的设备列表
 */
export const getDevice = (category?: string) => {
  return defHttp.get<DeviceListModel>({
    url: modelUrl + Api.Device,
    params: { category },
  })
}

/**
 * @description 获取使能的设备
 */
export const getEnableDevices = () => {
  return defHttp.get<DeviceListModel>({
    url: modelUrl + Api.Device,
    params: { enable: true },
  })
}

/**
 * @description 删除指定id的设备
 */
export const deleteDevice = (id: number) => {
  return defHttp.delete<DeleteModel>({
    url: modelUrl + Api.Device + id + '/',
  })
}

/**
 * @description 更新设备类型
 */
export const updateDevice = data => {
  if (data.id) {
    return defHttp.put({ url: modelUrl + Api.Device + data.id + '/', data })
  } else {
    return defHttp.post({ url: modelUrl + Api.Device, data })
  }
}
