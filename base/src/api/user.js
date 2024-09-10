import request from '@/utils/request'
import keycloakInfo from '@/utils/setKeycloak'

//登录
export function login(data) {
  return request({
    url: '/api/ld_user/login',
    method: 'post',
    data
  })
}

//sso登录
export function ssoLogin(data) {
  return request({
    url: `http://${window.server.ssoPrefix}/api/access-policy/login`,
    method: 'post',
    data
  })
}

//校验过期重置token
export function ResetToken(data) {
  return request({
    //Django
    url: '/api/userauth/token',
    method: 'get',
    data
  })
}

//用户信息及权限
export function getInfo() {
  return request({
    url: '/api/userauth/authright',
    method: 'GET'
  })
}
//退出登录
export function logout() {
  return request({
    url: keycloakInfo.logout,
    method: 'GET'
  })
}

//页面计数
export function counters(data) {
  return request({
    url: `/api/ld_user/other/counters/${data.name}`,
    method: 'POST',
    data
  })
}

//新增用户组
export function addRoleGroupe(data){
  return request({
    url: `/api/ld_user/roles`,
    method: 'POST',
    data
  })
}

//获取用户组
export function getRoleGroupe(data){
  let url = '/api/ld_user/roles'
  if(data){
    let matrix = Object.entries(data)
    matrix.forEach((item,index)=>{
      if(index == 0){
        url+=`?${item[0]}=${item[1]}`
      }else{
        url+=`&${item[0]}=${item[1]}`
      }
    })
  }

  return request({
    url: url,
    method: 'GET'
  })
}



//获取单个用户组权限信息
export function getRoleItem(data){
  return request({
    url: `/api/ld_user/roles/${data}`,
    method: 'GET'
  })
}

//获取单个用户组权限信息 可以翻页2023.4.23add暂不启用 目前getRoleItem使用前端分页
export function getRoleItemPage(data){
  return request({
    url: `/api/ld_user/roles/${data}/users`,
    method: 'GET'
  })
}
//删除用户组
export function deleteRoleGroupes(data){
  return request({
    url: `/api/ld_user/roles/${data}`,
    method: 'DELETE'
  })
}

//更新用户组信息
export function putRoleGroupes(data){
  return request({
    url: `/api/ld_user/roles/${data.role_id}`,
    method: 'PUT',
    data
  })
}

//获取全部权限列表
export function getAllfunctions(data){
  let url = '/api/ld_user/functions'
  let matrix = Object.entries(data)
  matrix.forEach((item,index)=>{
    if(index == 0){
      url+=`?${item[0]}=${item[1]}`
    }else{
      url+=`&${item[0]}=${item[1]}`
    }
  })
  return request({
    url: url,
    method: 'GET'
  })
}

//获取用户列表信息
export function getusers(data){
  let url = '/api/ld_user/users'
  let matrix = Object.entries(data)
  matrix.forEach((item,index)=>{
    if(index == 0){
      url+=`?${item[0]}=${item[1]}`
    }else{
      url+=`&${item[0]}=${item[1]}`
    }
  })
  return request({
    url: url,
    method: 'GET'
  })
}

//新增用户
export function addUsers(data){
  return request({
    url: `/api/ld_user/users`,
    method: 'POST',
    data
  })
}

//删除用户
export function deleteUsers(user_id){
  return request({
    url: `/api/ld_user/users/${user_id}`,
    method: 'DELETE'
  })
}

//更新用户信息
export function putUsers(data){
  return request({
    url: `/api/ld_user/users/${data.user_id}`,
    method: 'PUT',
    data
  })
}

//更新用户组权限 新增
export function putRolebondfunction(data){
  return request({
    url: `/api/ld_user/roles/${data.role_id}/actions/bond_function`,
    method: 'PUT',
    data
  })
}

//更新用户组权限 去除
export function putRoleunbondfunction(data){
  return request({
    url: `/api/ld_user/roles/${data.role_id}/actions/unbond_function`,
    method: 'PUT',
    data
  })
}

// 为指定角色添加人员
export function putBond_user(data){
  return request({
    url: `/api/ld_user/roles/${data.role_id}/actions/bond_user`,
    method: 'PUT',
    data
  })
}

// 为指定角色移除人员
export function putunbond_user(data){
  return request({
    url: `/api/ld_user/roles/${data.role_id}/actions/unbond_user`,
    method: 'PUT',
    data
  })
}

// 修改指定用户信息
export function put_user_info(data){
  return request({
    url: `/api/ld_user/users/${data.id}`,
    method: 'PUT',
    data
  })
}

//找回密码-提交邮箱信息
export function SubmitEmil(data){
  return request({
    url: data.token?`/api/ld_user/password?token=${data.token}`:`/api/ld_user/password`,
    method: 'POST',
    data
  })
}

//读取配置文件
export function getConfigure() {
  return request({
    url: '/front_end_configure',
    method: 'GET'
  })
}

//读取自定义流水线的配置
export function getPipelinesConfigure() {
  return request({
    url: '/api/ld_pipeline/pipelines/config?limit=0',
    method: 'GET'
  })
}

export function getCompanys() {
  return request({
    url: '/api/ld_user/companys',
    method: 'GET'
  })
}


export function func_reviewers(){
  return request({
    url: `/api/func_reviewers/`,
    method: 'GET'
  })
}