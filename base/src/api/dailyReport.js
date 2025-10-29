import request from '@/utils/request'

export function getJiraTasks(data){
  return request({
    url: `/api/func_pull_jira`,
    method: 'GET'
  })
}