/*
 * @Author: your name
 * @Date: 2021-07-09 14:49:00
 * @LastEditTime: 2022-03-01 14:57:28
 * @LastEditors: your name
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \WEB_FrontEnd\data-management-system\src\router\modules\KPI.js
 */
import Layout from '@/layout'

const KPInew = {
  path: '/dataManagement/KPI',
  component: Layout,
  name: 'KPI',
  redirect: '/dataManagement/KPI/KpiList',
  meta: {
    title: 'KPI',
    roles: ['研发','销售'],
    icon: 'KPI'
  },
  children: [
    {
      path: 'KpiList',
      component: () => import('@/views/KPI-new/KPIList/KPIList.vue'),
      name: 'sensorEvaluation_taskList',
      hidden: false,
      meta: { title: 'sensorEvaluation_taskList', roles: ['研发','销售'], noCache: true }
    },{
      path: 'createNewKpi',
      component: () => import('@/views/KPI-new/createKPI/index.vue'),
      name: 'createNewKpi',
      hidden:true,
      redirect: '/dataManagement/KPI/createNewKpi/filechoose',
      meta: { title: 'createNewKpi', roles: ['研发','销售'], noCache: true },
      children:[
        {
          path: 'filechoose',
          component: () => import('@/views/KPI-new/createKPI/filechoose.vue'),
          name: 'filechoose',
          meta: { title: 'filechoose', roles: ['研发','销售'], noCache: true },
        }
      ]
    },
  ]
}

const KPI = {
  path: '/dataManagement/KPI',
  component: Layout,
  name: 'KPI',
  redirect: '/dataManagement/KPI/KpiList',
  // component: () => import('@/views/KPI'),
  meta: {
    title: 'KPI',
    roles: ['研发','销售'],
    icon: 'KPI',
  },
  children: [
    //更新版本
    {
      path: 'KpiList',
      component: () => import('@/views/KPI/KPITest/taskList'),
      name: 'sensorEvaluation_taskList',
      hidden: true,
      meta: { title: 'sensorEvaluation_taskList', roles: ['研发','销售'], noCache: true }
    },
    {
      path: 'SetROI',
      component: () => import('@/views/KPI/KPITest/ROI'),
      name: 'SetROI',
      hidden: true,
      meta: { title: 'SetROI', roles: ['研发','销售'], noCache: true }
    },
    //场景V2.04版本  KPI
    // {
    //   path: 'index',
    //   component: () => import('@/views/KPI/DUTEvaluation'),
    //   name: 'index',
    //   meta: { title: 'KPI_management', noCache: true,roles: ['市场','销售','研发'] }
    // },
    {
      path: 'tasklist',
      component: () => import('@/views/KPI/sensorEvaluation/taskList'),
      name: 'sensorEvaluation_taskList',
      hidden: true,
      meta: { title: 'sensorEvaluation_taskList', roles: ['研发','销售'], noCache: true }
    },{
      path: 'sensorEvaluation',
      component: () => import('@/views/KPI/sensorEvaluation'),
      name: 'sensorEvaluation',
      hidden: true,
      meta: { title: 'sensorEvaluation', roles: ['研发','销售'], noCache: true }
    },{
      path: 'createKpi/:id/:ROIparams',
      component: () => import('@/views/KPI/DUTEvaluation/createKpi'),
      name: 'createKpi',
      hidden: true,
      meta: { title: 'createKpi', roles: ['研发','销售'], noCache: true }
    },
  ]
}

export default KPInew
