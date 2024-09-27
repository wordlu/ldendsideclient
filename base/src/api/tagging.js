import request from '@/utils/request'

//采集计划 信息列表
export function collection_plan(){
  return request({
    // url: '/dashboard/collection_plan/',
    url: '/dashboard/collection_plan/',
    method: 'GET'
  })
}

// 创建计划
export function createdCollection_plan(data){
  return request({
    // url: '/dashboard/collection_plan/',
    url: '/dashboard/collection_plan/',
    method: 'POST',
    data
  })
}

// 更新计划
export function updateCollection_plan(data){
  return request({
    url: '/dashboard/collection_plan/'+data.plan_id,
    method: 'PATCH',
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

// 获取车辆
export function getVehicle(){
  return request({
    url: '/dashboard/vehicle/',
    method: 'GET'
  })
}

// 获取task列表
export function getTaskList(){
  return request({
    url: '/dashboard/collection_task/',
    method: 'GET'
  })
}

// 根据plan 筛选路线
export function inPlanSelectRoute(data){
  return request({
    url: '/dashboard/plan_routes/'+data,
    method: 'GET',
    data
  })
}

//获取司机 采集员等信息
export function getParticipant(){
  return request({
    url: '/dashboard/participant/',
    method: 'GET',
  })
}

//获取 场景提取配置
export function scen_detect_conf(){
  return request({
    url: '/dashboard/scen_detect_conf/',
    method: 'GET',
  })
}

//添加Task
export function addTask(data){
  return request({
    url:'/dashboard/collection_task/',
    method:'POST',
    data
  })
}

//更新Task
export function partial_update(data){
  return request({
    url:'/dashboard/collection_task/'+data.task_id,
    method:'PUT',
    data
  })
}

// 获取采集车出车信息
export function get_tagging_state(){
  return request({
    url: '/dashboard/tagging_state/',
    method: 'GET',
  })
}

//获取DUT device 列表
export  function get_Dut_device(){
  return request({
    url: '/dashboard/device/',
    method: 'GET',
  })
}

//获取任务详情
export  function get_Task_info(data){
  return request({
    url:'/dashboard/collection_task/'+data.task_id,
    method:'GET'
  })
}
//采集任务
export function collection_task(data) {
  let url = '/ld_dm/dashboard/collection_task'
  let matrix = Object.entries(data)
  matrix.forEach((item,index)=>{
    if(index == 0){
      url+=`?${item[0]}=${item[1]}`
    }else{
      url+=`&${item[0]}=${item[1]}`
    }
  })
  return request({
    url: url,
    method: 'GET'
  })
}