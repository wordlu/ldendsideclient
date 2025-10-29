import request from '@/utils/request'
import Cookies from 'js-cookie'
//采集里程及时长统计
export function aqu_statis() {
  return request({
    url:'/api/ld_dm/dashboard/aqu_statis?limit=0&offset=0',
    method: 'get'
  })
}

export function getDataList() {
  return request({
    url: system+'/api/dashboard/scenario_topic',
    method: 'get'
  })
}
