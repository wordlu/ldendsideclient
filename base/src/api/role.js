import request from '@/utils/request'

//创协同标注工具的登录账户
export function CreateFunctionUsers(data) {
  return request({
    url: '/Labelling/lbl_user/',
    method: 'POST',
    data
  })
}
