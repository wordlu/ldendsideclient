import { Message , Notification } from 'element-ui'
import store from '@/store'
import Cookies from 'js-cookie'
import keycloakInfo from '@/utils/setKeycloak'

// API error
export function errors(error){
  // Output error on the console
  console.error(error,'error')

  if(error.error_code){
    if(error.error_code == 401){
      store.dispatch('operation/resetToken',Cookies.get('refresh_token')).then(() => {}).catch(error=>{
        store.dispatch('operation/logout').then(() => {
          location.reload()
        })
        // 退出时调用keycloak 登出接口
        location.href = keycloakInfo.logout;
      })
      location.href = keycloakInfo.logout_redirect_uri;
    }
  }

  if (error.errors) {
    if(error.errors.length == 1){
      Message({
        message: error.errors[0].detail,
        type: 'error'
      })
    }else{
      // Work with each error from the JSONAPI 'errors' array
      let errors;
      for (let i=0;i<error.errors.length;i++) {
        errors += `<div style="color:red;padding:5px"> ${i}. ${error.errors[i]} </div>`
      }
      //Notification
      Notification({
        title: 'error',
        dangerouslyUseHTMLString: true,
        message: errors,
        type: 'error'
      });
    }
  } else {
    // Some other type of error
    Message({
      message: error.message?error.message:(error.error_message?error.error_message:'服务器内部错误，请联系相关部门解决'),
      type: 'error'
    })
  }
}