/*
 * @Author: your name
 * @Date: 2022-03-02 15:25:21
 * @LastEditTime: 2022-03-02 21:53:26
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \WEB_FrontEnd\data-management-system\src\router\modules\Pretreatment.js
 */
import Layout from '@/layout'

const Pretreatment = {
  path: '/Pretreatment',
  component: Layout,
  name: 'Pretreatment',
  redirect: '/Pretreatment',
  meta: {
    title: 'Pretreatment',
    roles: ['研发','销售','客户','数据平台'],
    icon: 'analysis'
  },
  children: [
    {
      path: 'index',
      component: () => import('@/views/Pretreatment/index'),
      name: 'index',
      meta: { title: 'Pretreatment', noCache: true,roles: ['研发','销售','客户','数据平台'] }
    }
  ]
}

export default Pretreatment
