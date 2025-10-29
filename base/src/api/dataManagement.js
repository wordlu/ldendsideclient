import request from '@/utils/request'

//获取所有的场景信息
export function getDataList() {
  return request({
    url: '/dashboard/scenario_topic',
    method: 'get'
  })
}

//通过筛选获取场景文件信息列表
export function getFileList(data) {
  return request({
    url: '/api.liangdao.com/metadata/scenario_match?cond={"condition":'+data+'}',
    method: 'get'
  })
}


