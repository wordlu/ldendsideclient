import request from '@/utils/request'
//获取检索文件目录
export function datadir(data) {
  return request({
    url: '/api.liangdao.com/datadir/nas?path='+data,
    method: 'get'
  })
}

//未场景配对的采集任务
export function collection_task_search(data){
  return request({
    url:'/dashboard/collection_task_search',
    method:'POST',
    data
  })
}

export function scenariotopic_key_label(){
  return request({
    url:'/dashboard/scenariotopic_key_label',
    method:'GET'
  })
}

export function scenariotopic_value_label(data){
  return request({
    url:'/dashboard/scenariotopic_value_label/'+data,
    method:"GET"
  })
}

