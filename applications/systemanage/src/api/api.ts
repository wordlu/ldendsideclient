import request from '../utils/request'
import { setQuery } from "./lib/setQuery"

declare global {
  interface Window { server: any; }
}

export function funcKpiTasksPost(data:any) {
  return request({
    url: `/kpi/kpi_tasks`,
    method: 'post',
    headers: {
      'Content-Type':'application/vnd.api+json'
    },
    data
  })
}

export function funcReportAssetsGet(query) {
  return request({
    url: `/kpi/report_assets/${query.id}`,
    method: 'get',
    params: {}
  })
}


export function funcKpiReportTasks(data:any) {
  return request({
    url: `/kpi/report_tasks`,
    method: 'post',
    headers: {
      'Content-Type':'application/vnd.api+json'
    },
    data
  })
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

export function getMdData(query) {
  return request({
    url: `http://dms${window.server.domain}/${query.path}`,
    method: 'get',
    params: {}
  })
}