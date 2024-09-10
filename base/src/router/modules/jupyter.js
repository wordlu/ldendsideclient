/*
 * @Author: your name
 * @Date: 2021-07-09 14:49:00
 * @LastEditTime: 2022-03-01 14:21:16
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeade1`r查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \data-management-system\src\router\modules\jupyter.js
 */
import Layout from '@/layout'

const Jupyter = {
  path: '/jupyter',
  component: Layout,
  name: 'dataAnalysis',
  redirect: '/jupyter',
  meta: {
    title: 'dataAnalysis',
    roles: ['研发','销售','客户','数据平台'],
    icon: 'analysis'
  },
  children: [
    {
      path: 'index',
      component: () => import('@/views/jupyter/index'),
      name: 'index',
      meta: { title: 'dataAnalysis', noCache: true,roles: ['研发','销售','客户','数据平台'] }
    }
  ]
}

export default Jupyter
