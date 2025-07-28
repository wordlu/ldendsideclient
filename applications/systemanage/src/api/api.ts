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

export function getMdData(query) {
  return request({
    url: `http://dms${window.server.domain}/${query.path}`,
    method: 'get',
    params: {}
  })
}

export function vehicle_anchor_patch(data:any) {
  return request({
    url: `http://10.86.14.25:8000/api/logger/models/viewports/1/vehicle_anchor`,
    method: 'patch',
    headers: {
      'Content-Type': 'application/json',
    },
    data
  })
}

export function vehicle_anchor_get() {
  return request({
    url: `http://10.86.14.25:8000/api/logger/models/viewports/1/vehicle_anchor`,
    method: 'get',
    params: {}
  })
}