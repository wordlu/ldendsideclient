import request from '../utils/request'
import { setQuery } from "./lib/setQuery"

export function findAll(module:string,data:any) {
  const url = setQuery(module,data)
  return request({
    url: url,
    method: 'get',
    headers: {
      'Content-Type':'application/vnd.api+json'
    }
  })
}

export function findItem(module:string,id:number,data:any) {
  const urlstr = `/${module}/${id}`
  const url = setQuery(urlstr, data)
  return request({
    url: url,
    method: 'get',
    headers: {
      'Content-Type':'application/vnd.api+json'
    }
  })
}

export function addItem(module:string,params:any) {
  debugger
  return request({
    url: module,
    method: 'post',
    headers: {
      'Content-Type':'application/vnd.api+json'
    },
    data:params
  })
}


export function patchItem(module:string,params:any) {
  return request({
    url: `${module}/${params.data.id}`,
    method: 'patch',
    headers: {
      'Content-Type':'application/vnd.api+json'
    },
    data:params
  })
}