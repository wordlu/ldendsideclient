/*
 * @Author: your name
 * @Date: 2021-09-22 17:03:09
 * @LastEditTime: 2022-02-25 10:21:14
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \data-management-system\src\router\modules\sceneLabelling.js
 */
//场景标注及审核
import Layout from '@/layout'

const scenario = {
  path: '/scene',
  component: Layout,
  name: 'sceneLabeling',
  redirect: '/scene/labeling',
  meta: {
    title: 'sceneLabeling',
    icon: 'labeling',
    roles: ['市场','销售','研发','客户','数据平台']
  },
  children: [
    {
      path: 'labeling',
      component: () => import('@/views/sceneLabeling/index.vue'),
      name: 'labeling',
      meta: { title: 'labeling', noCache: true,roles: ['市场','销售','研发','客户','数据平台'] }
    },{
      path: 'evaluating',
      component: () => import('@/views/sceneLabeling/evaluating/evaluating'),
      name: 'evaluating',
      meta: { title: 'evaluating', noCache: true,roles: ['市场','销售','研发','客户','数据平台'] }
    }
  ]
}

export default scenario
