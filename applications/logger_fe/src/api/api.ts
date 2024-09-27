import request from '../utils/request'
import { setQuery } from "./lib/setQuery"

declare global {
  interface Window { server: any; }
}

export function funcGovernanceTask(data:any) {
  return request({
    url: `http://dms${window.server.domain}/api/func-governance-task`,
    method: 'post',
    headers: {
      'Content-Type':'application/vnd.api+json'
    },
    data
  })
}

export function funcGovernanceLog(query:any) {
  return request({
    url: `http://dms${window.server.domain}/api/func-governance-log`,
    method: 'get',
    params: query
  })
}

export function getRemoteFile(query) {
  return request({
    url: `http://daily-report-dev.10.86.14.200.nip.io/test.vue`,
    method: 'get',
    params: {}
  })
}