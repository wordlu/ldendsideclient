import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'

export interface Result<T = any> {
  code: number
  type: 'success' | 'error' | 'warning'
  message: string
  result: T
}

export class VAxios {
  private axiosInstance: AxiosInstance
  private readonly options: AxiosRequestConfig

  constructor(options?: AxiosRequestConfig) {
    this.options = options || {}
    this.axiosInstance = axios.create(options)
    this.setupInterceptors()
  }

  get<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'GET' })
  }

  post<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'POST' })
  }

  put<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'PUT' })
  }

  delete<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'DELETE' })
  }

  request<T = any>(config: AxiosRequestConfig): Promise<T> {
    return new Promise((resolve, reject) => {
      this.axiosInstance
        .request<any, AxiosResponse<Result>>(config)
        .then((res: AxiosResponse<Result>) => {
          resolve(res as unknown as Promise<T>)
        })
        .catch((e: Error) => {
          if (axios.isAxiosError(e)) {
            // rewrite error message from axios in here
          }
          reject(e)
        })
    })
  }

  /**
   * @description: Interceptor configuration 拦截器配置
   */
  private setupInterceptors() {
    // Request interceptor configuration processing
    this.axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => {
      // 请求拦截
      return config
    }, undefined)

    // Response result interceptor processing
    this.axiosInstance.interceptors.response.use(
      (res: AxiosResponse<any>) => {
        // 响应拦截
        if (res && res.status === 200) {
          return res.data
        }
        return res
      },
      error => {
        let status = null
        if (error.request) {
          status = error.request
        } else if (error.response) {
          status = error.response
        }
        if (status) {
          let message = ''
          switch (status.status) {
            case 400:
              message = '请求错误'
              break
            default:
              message = '网络错误'
          }
          return { status: status.status, message }
        }
      }
    )
  }

  setBaseURL(baseURL: string) {
    this.axiosInstance.defaults.withCredentials = true
    this.axiosInstance.defaults.baseURL = baseURL
  }
}
