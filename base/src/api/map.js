/*
 * @Author: your name
 * @Date: 2021-07-09 14:48:54
 * @LastEditTime: 2021-09-29 11:00:39
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \data-management-system\src\api\map.js
 */
import request from '@/utils/request'
//根据城市名获取路线
export function routeList(data) {
  return request({
    url: '/dashboard/plan_routes/'+data,
    method: 'POST',
    data
  })
}

// 获取地区
export function getArea(){
  return request({
    url: '/dashboard/area',
    method: 'GET'
  })
}

//IP 定位
export function getAmapIPPosition(data){
  return request({
    url: '/v5/ip?parameters&key='+data.key+'&type='+data.type+'&ip='+data.ip,
    method: 'GET',
  })
}

// 访问高德地图API - 路径规划
export function getAmapPathData(data){
  return request({
    url: '/v5/direction/driving?parameters&key='+data.key+'&origin='+data.origin+'&destination='+data.destination+'&AlternativeRoute='+data.AlternativeRoute,
    method: 'GET',
  })
}

// mapbox - 路径规划
export function getMapBoxPathData(data){
  return request({
    url: '/matching/v5/mapbox/driving?access_token=pk.eyJ1IjoibGlhbmdkYW8iLCJhIjoiY2tybG8zNjB6MG84MjJvbDdkd2pmcXVkdyJ9.kZVSrv9vx82-VUD-NiyYQg',
    method: 'POST',
    data
  })
}
