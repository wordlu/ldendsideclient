import request from '@/utils/request'
//创建前处理任务
export function createPretreatmentTask(data) {
  return request({
    url: '/pre_task/preprocess_create_task',
    method: 'POST',
    data
  })
}

//获取前处理主任务
export function getPretreatmentTask_parent(data) {
    return request({
      url: '/pre_task/preprocess_parent_task?page='+data.page+'&size'+data.size,
      method: 'POST'
    })
  }

//获取前处理子任务
export function getPretreatmentTask_sub(id) {
    return request({
      url: '/pre_task/preprocess_sub_task/'+id,
      method: 'GET'
    })
  }