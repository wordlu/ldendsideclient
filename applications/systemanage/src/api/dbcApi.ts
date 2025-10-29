import axios from 'axios'
import jsCookie from "js-cookie"

// 创建专门的DBC API请求实例
const dbcRequest = axios.create({
  baseURL: 'http://10.86.14.25:18000',
  timeout: 3600000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
dbcRequest.interceptors.request.use(config => {
  const token = `Bearer ${jsCookie.get('Token')}`
  if (token) {
    config.headers.Authorization = token
  }
  return config
}, error => {
  console.log(error)
  return Promise.reject(error)
})

// DBC API 接口
export const dbcApi = {
  // 获取所有DBC文件列表
  getDbcList() {
    return dbcRequest({
      url: '/can_parser/dbc',
      method: 'get'
    })
  },

  // 获取当前使用的DBC文件
  getCurrentDbc() {
    return dbcRequest({
      url: '/can_parser/dbc/current',
      method: 'get'
    })
  },

  // 设置当前使用的DBC文件
  setCurrentDbc(name: string) {
    return dbcRequest({
      url: '/can_parser/dbc/current',
      method: 'put',
      data: { name }
    })
  },

  // 获取指定DBC文件详情
  getDbcDetail(name: string) {
    return dbcRequest({
      url: `/can_parser/dbc/${name}`,
      method: 'get'
    })
  },

  // 更新DBC文件信息
  updateDbc(name: string, data: { name?: string; description?: string }) {
    return dbcRequest({
      url: `/can_parser/dbc/${name}`,
      method: 'put',
      data
    })
  },

  // 删除DBC文件
  deleteDbc(name: string) {
    return dbcRequest({
      url: `/can_parser/dbc/${name}`,
      method: 'delete'
    })
  },

  // 上传DBC文件
  uploadDbc(formData: FormData) {
    return dbcRequest({
      url: '/can_parser/dbc',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
} 