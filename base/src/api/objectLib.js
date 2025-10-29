import request from '@/utils/request'

//物体搜索列表
export function object_list(data){
  let url = '/smp_object_lib/object_info/'
  let matrix = Object.entries(data)
  matrix.forEach((item,index)=>{
    if(index == 0){
      url+=`?${item[0]}=${item[1]}`
    }else{
      url+=`&${item[0]}=${item[1]}`
    }
  })
  return request({
    url:url,
    method: 'GET'
  })
}
