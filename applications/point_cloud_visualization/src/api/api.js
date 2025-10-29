import request from '../utils/request'

export function Get(model,params){
  let url = model;
  let matrix = Object.entries(params)
  matrix.forEach((item,index)=>{
    if(index == 0){
      url+=`?${item[0]}=${item[1]}`
    }else{
      url+=`&${item[0]}=${item[1]}`
    }
  })
  return request({
    url:url,
    method:'GET'
  })
}

export function Post(model,params){
  return request({
    url:model,
    method:'POST',
    timeout:3600000,
    data:params
  })
}

export function Put(model,params){
  return request({
    url:model,
    method:'PUT',
    data:params
  })
}

export function Delete(model,params){
  return request({
    url:model,
    method:'DELETE',
    data:params
  })
}

export function func_scene_thumbnail(data) {
  const urlParams = new URLSearchParams(window.location.search);
  const reqip= urlParams.get('reqip');
  let url = reqip ? `${reqip}/api/func_scene_thumbnail` : `/api/func_scene_thumbnail`
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
    method: 'get',
    headers: {
      'Content-Type':'application/vnd.api+json'
    }
  })
}

export function func_scenes(data) {
  const urlParams = new URLSearchParams(window.location.search);
  const reqip= urlParams.get('reqip');
  let url = reqip ? `${reqip}/api/func_scenes` : `/api/func_scenes`
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
    method: 'get',
    headers: {
      'Content-Type':'application/vnd.api+json'
    }
  })
}

export function func_create_scenes(data) {
  const urlParams = new URLSearchParams(window.location.search);
  const reqip= urlParams.get('reqip');
  let url = reqip ? `${reqip}/api/func_scenes` : `/api/func_scenes`
  return request({
    url: url,
    method:'POST',
    data
  })
}