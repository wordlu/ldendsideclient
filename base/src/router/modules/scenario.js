/*
 * @Author: your name
 * @Date: 2021-07-09 14:49:00
 * @LastEditTime: 2022-02-25 10:20:58
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \data-management-system\src\router\modules\scenario.js
 */
import Layout from '@/layout'

const scenario = {
  path: '/scenario',
  component: Layout,
  name: 'scenario',
  redirect: '/scenario/index',
  meta: {
    title: 'scenario',
    icon: 'scenario',
    roles: ['市场','销售','研发','客户','数据平台']
  },
  children: [
    {
      path: 'index',
      component: () => import('@/views/scenario/index'),
      name: 'scenarioDashbord',
      meta: { title: 'scenarioDashbord', noCache: true,roles: ['市场','销售','研发','客户','数据平台'] }
    },{
      path: 'search',
      component: () => import('@/views/scenario/search'),
      name: 'scenarioSearch',
      meta: { title: 'scenarioSearch', noCache: true,roles: ['市场','销售','研发','客户','数据平台'] }
    },{
      path: 'scenarioBank',
      component: () => import('@/views/scenario/scenarioBank'),
      name: 'scenarioBank',
      meta: { title: 'scenarioBank', noCache: true,roles: ['市场','销售','研发','客户','数据平台'] }
    },{
      path: 'review',
      component: () => import('@/views/scenario/review'),
      name: 'scenarioBankReview',
      meta: { title: 'scenarioBankReview', noCache: true,roles: ['市场','销售','研发','客户','数据平台'] }
    },{
      path: 'sceneMining',
      component: () => import('@/views/scenario/sceneMining'),
      name:'sceneMining',
      meta: { title: 'sceneMining', noCache: true,roles: ['市场','销售','研发','客户','数据平台'] }
    },{
      path: 'taskScenario',
      component: () => import('@/views/scenario/taskScenario'),
      name:'taskScenario',
      meta: { title: 'taskScenario', noCache: true, roles: ['市场','销售','研发','客户','数据平台'] }
    },{
      path: 'scenarioAnalysis',
      component: () => import('@/views/scenario/scenarioAnalysis'),
      name:'scenarioAnalysis',
      meta: { title: 'scenarioAnalysis', noCache: true,roles: ['市场','销售','研发','客户','数据平台'] }
    },{
      path: 'sceneTree',
      component: () => import('@/views/scenario/sceneTree'),
      name:'sceneTree',
      meta: { title: 'sceneTree', noCache: true,roles: ['市场','销售','研发','数据平台'] }
    }
    // ,{
    //   path: 'test',
    //   component: () => import('@/views/scenario/test'),
    //   name:'test',
    //   meta: { title: 'test', noCache: true,roles: ['研发'] }
    // },
    // {
    //   path: 'Detailspage/:scene_id/:obj_id',
    //   component: () => import('@/views/scenario/Detailspage/index'),
    //   hidden: true,
    //   name:'Detailspage',
    //   meta: { title: 'Detailspage', noCache: true,roles: ['市场','销售','研发'] }
    // }
  ]
}

export default scenario
