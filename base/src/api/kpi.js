/*
 * @Author: your name
 * @Date: 2021-07-09 14:48:54
 * @LastEditTime: 2022-03-02 21:15:00
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 *
 * @FilePath: \data-management-system\src\api\kpi.js
 */
import request from '@/utils/request'

//新版KPI

export function KpiTaskList(data){
  return request({
    url: `/kpi/kpi_list?page=${data.page}&size=${data.size}`,
    method: 'GET'
  })
}

export function createdKpiTask(data){
  return request({
    url:'/kpi/create_pdf',
    method:'POST',
    data
  })
}


//旧版KPI
export function KpiSensorList() {
  return request({
    url: '/dashboard/sensor',
    method: 'get'
  })
}

// 获取KPI展示数据
export function evaluate_device(data){
  return request({
    url:'/kpi/evaluate_device',
    method:'POST',
    data
  })
}

// created kpi order
export function kpi_order(data){
  return request({
    url:'/kpi/kpi_order/',
    method:'POST',
    data
  })
}

//获取order_list列表
export function kpi_order_list(){
  return request({
    url:'/kpi/kpi_order/',
    method:'GET'
  })
}

//获取KPI——info
export function kpi_info(data){
  return request({
    url:"/kpi/kpi_info/"+data,
    method:'GET'
  })
}

// created kpi order
export function partial_update(data){
  return request({
    url:'/kpi/kpi_order/'+data,
    method:'PATCH'
  })
}

// created kpi order
export function kpi_result(data){
  return request({
    url:'/kpi/kpi_result/'+data,
    method:'GET'
  })
}

//获取历史KPI生成列表
export function get_kpi_order(){
  return request({
    url:'/smp_web/kpi_order/',
    method:'GET'
  })
}

//dut_task_search
export function dut_task_search(page,size){
  return request({
    url:'/smp_web/dut_task_search?page='+page+'&size='+size,
    method:'GET'
  })
}

//KPI评测
export function kpi_ref_dut(data){
  return request({
    url:'/smp_pub_raw/kpi_ref_dut',
    method:'POST',
    data
  })
}

//获取KPI结果
export function kpi_result_data(kpi_csv_name){
  return request({
    url:'/smp_pub_raw/kpi_result/'+ kpi_csv_name,  //{kpi_csv_name}
    method:'GET'
  })
}


