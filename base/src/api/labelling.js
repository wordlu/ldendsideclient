import request from '@/utils/request'

//协同标注任务列表
export function LabellingTaskList() {
  return request({
    url: '/dashboard/lbl_tasks',
    method: 'GET'
  })
}

export function lbl_task_list(){
  return request({
    url: '/Labelling/lbl_task_list',
    method: 'GET'
  })
}

//协同标注 - 人员列表
export function lbl_users() {
  return request({
    url: '/dashboard/lbl_users',
    method: 'GET'
  })
}

//协同标注 - 创建任务
export function createLabellingTask(data) {
  return request({
    url: '/dashboard/lbl_users',
    method: 'PSOT',
    data
  })
}

//通过 plan_id 获取 对应的task列表(已完成的task)
export function PlanSelectTaskList(data){
  return request({
    url:'/dashboard/plan2task/'+data,
    method:'GET'
  })
}

//通过 采集任务 筛选 文件信息
export function TaskSelectFileInfo(data){
  return request({
    url:'/dashboard/task2data/'+data,
    method:'GET'
  })
}

//创建任务
export function createLabellingTaskAPI(data){
  return request({
    url:'/Labelling/task',
    method:'POST',
    data
  })
}

//任务筛选
export function lbl_tasks_retrieval(data){
  return request({
    url:'/dashboard/lbl_tasks_retrieval/'+data,
    method:"get"
  })
}

// 标注任务分配
export function lbl_task_assign(data){
  return request({
    url:'/Labelling/task_assign',
    method:"POST",
    data
  })
}
