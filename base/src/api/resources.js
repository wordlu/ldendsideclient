import request from '@/utils/request'
//添加设备
export function createDevice(data) {
  return request({
    url: '/dashboard/device/',
    method: 'post',
    data
  })
}

//设备列表
export function lookDeviceList(){
  return request({
    url:'/dashboard/device/',
    method:'get'
  })
}

//设备修改
export function modifyDeviceList(data){
  return request({
    url:'/dashboard/device/'+data.device_id+'/',
    method:'PATCH',
    data
  })
}

//删除设备
export function deleteDeviceList(data){
  return request({
    url:'/dashboard/device/'+data.device_id+'/',
    method:'DELETE'
  })
}

//获取车辆
export function getVehicleList(){
  return request({
    url:'/dashboard/vehicle/',
    method:'get'
  })
}

//新添车辆
export function createVehicle(data){
  return request({
    url:'/dashboard/vehicle/',
    method:'post',
    data
  })
}

//修改车辆信息
export function modifyVehicle(data){
  return request({
    url:'/dashboard/device_desc',
    method:'POST',
    data
  })
}

//删除车辆
export function deleteVehicle(data){
  return request({
    url:'/dashboard/vehicle/'+data.vehicle_id+'/',
    method:'DELETE'
  })
}

//获取设备
export function device_model(){
  return request({
    url:'/dashboard/device_combination_desc',
    method:'GET'
  })
}

//获取路线列表
export function getRouterList(){
  return request({
    url:'/dashboard/route/',
    method:'GET'
  })
}

//创建路线
export function createRouterList(data){
  return request({
    url:'/dashboard/route/',
    method:'POST',
    data
  })
}

// 获取地区
export function getArea(){
  return request({
    url: '/dashboard/area',
    method: 'GET'
  })
}

// 设备组合列表
export function getDeviceCombinationList(){
  return request({
    url:'/dashboard/device_combination_desc',
    method:'GET'
  })
}

// 新建设备组合
export function createdDevicecombination(data){
  return request({
    url:'/dashboard/device_combination/',
    method:'POST',
    data
  })
}

//KPI 业务整改

/**
  * 真值系统创建
  * DUT系统创建
  *
*/
export function device_combination(data){
  return request({
    url:'/dashboard/device_combination/',
    method:'POST',
    data
  })
}
