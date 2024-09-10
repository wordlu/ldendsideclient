import axios from 'axios'
import { Message , MessageBox } from 'element-ui'
import store from '@/store'
import Cookies from 'js-cookie'
import keycloakInfo from './setKeycloak'
let resetTokenExpire = 0
// create an axios instance
const service = axios.create({
  withCredentials: false, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

service.interceptors.request.use( config => {
  let token =  Cookies.get('Token');
  if(token){
    config.headers.Authorization = token
  }
  return config
},
error => {
  // do something with request error
  console.log(error) // for debug
  return Promise.reject(error)
})

// response interceptor
service.interceptors.response.use(
  response => {
    const res = response.data
    if(res.hasOwnProperty('status_code') == true){
      if (res.status_code !== 200 && res.status_code !== 201) {
        if(res.code === 'Ok' || res.status == 1){
          return res
        }
        return Promise.reject(new Error(res.message || 'Error'))
      }else {
        return res
      }
    }else{
      return res
    }
    // if the custom code is not 1000, it is judged as an error.
  },
  async(error) => {
    const res = (error.response || {}).data || {};
    const message = res.code ? res.message : error.message;




    if(error == 'Error: Request failed with status code 401'){
      if(Cookies.get('refresh_token')){
        if(resetTokenExpire == 0){
          await store.dispatch('operation/resetToken',Cookies.get('refresh_token')).then((res) => {
            console.log('重新登录了')
            location.reload()
          }).catch(err=>{
            MessageBox.alert('登录过期请重新登录', '登录过期', {
              confirmButtonText: '确定',
              callback: action => {
                store.dispatch('operation/logout').then(() => {
                  location.reload()
                  resetTokenExpire = 0
                })
              }
            });
            if(process.env.NODE_ENV !== "development"){
              location.href = keycloakInfo.logout
            }
          });
        }else{
          MessageBox.alert('登录过期请重新登录', '登录过期', {
            confirmButtonText: '确定',
            callback: action => {
              store.dispatch('operation/logout').then(() => {
                location.reload()
                resetTokenExpire = 0
              })
            }
          });
          if(process.env.NODE_ENV !== "development"){
            location.href = keycloakInfo.logout
          }
        }
      }else{
        MessageBox.alert('登录过期请重新登录', '登录过期', {
          confirmButtonText: '确定',
          callback: action => {
            store.dispatch('operation/logout').then(() => {
              location.reload()
              resetTokenExpire = 0
            })
          }
        });
        if(process.env.NODE_ENV !== "development"){
          location.href = keycloakInfo.logout
        }
      }
      resetTokenExpire++
    }else if(error == 'Error: Request failed with status code 403'){
      MessageBox.alert('该账户未分配权限，请联系管理员', '权限分配', {
        confirmButtonText: '确定',
        callback: action => {
          store.dispatch('operation/logout').then(() => {

            // location.reload()
            // resetTokenExpire = 0
          })
          if(process.env.NODE_ENV !== "development"){
            location.href = keycloakInfo.logout
          }
        }
      });
    }else if(res.error_code == 400){
      if (res.error_message.indexOf('not allowed to enter the system')!=-1) {
        res.error_message = '无权限进入此系统'
      }

      MessageBox.alert(res.error_message.indexOf("for key 'email'")!=-1?'该账户邮箱存在重复注册，请联系管理员解决':res.error_message, '登录提示', {
        confirmButtonText: '确定',
        callback: action => {
          store.dispatch('operation/logout').then(() => {

            // location.reload()
            // resetTokenExpire = 0
          })
          if(process.env.NODE_ENV !== "development"){
            location.href = keycloakInfo.logout
          }
        }
      });
    } else if(res.error_code == 409){
      MessageBox.alert(res.errorMessage == "User exists with same username"?'该用户名已存在':res.error_message, '冲突提示', {
        confirmButtonText: '确定'
      });
    } else if(res.error_code == 503) {
      if (res.error_message) {
        // Message.error(res.errorMessage)
        MessageBox.alert(res.error_message, '登录提示', {
          confirmButtonText: '确定',
          callback: action => {
            store.dispatch('operation/logout').then(() => {
              // location.reload()
              // resetTokenExpire = 0
            })
            if(process.env.NODE_ENV !== "development"){
              location.href = keycloakInfo.logout
            }
          }
        });
      }
    } else{
      // Message.error(res.errorMessage ? res.errorMessage : '登录失败')
    }
    // return handleResponseError(res, message);
    return Promise.reject(res,message)
  }
)

export default service
