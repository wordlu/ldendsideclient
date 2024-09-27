import request from '@/utils/request'

export function collection_plan() {
  return request({
    url: '/dashboard/collection_plan/',
    method: 'GET'
  })
}


export function collection_plan_create(data) {
  return request({
    url: '/dashboard/collection_plan/',
    method: 'POST',
    data
  })
}
