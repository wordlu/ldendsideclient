/*
 * @Author: your name
 * @Date: 2021-12-06 14:43:06
 * @LastEditTime: 2021-12-07 14:27:33
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \data-management-system\src\router\modules\HIL.js
 */
import Layout from '@/layout'

const HIL = {
  path: '/HIL',
  component: Layout,
  name: 'HIL',
  redirect: '/HIL/DeviceList',
  meta: {
    title: 'HIL',
    icon: 'HILDevice',
    roles: ['研发']
  },
  children: [
    {
      path: 'DeviceList',
      component: () => import('@/views/HIL/deviceList'),
      name: 'deviceList',
      meta: { title: 'deviceList', noCache: true,roles: ['研发'] }
    },{
      path: 'HILTask',
      component: () => import('@/views/HIL/HILTask'),
      name: 'HILTask',
      meta: { title: 'HILTask', noCache: true,roles: ['研发'] }
    },{
      path: 'DeviceList/:id',
      component: () => import('@/views/HIL/components/HILInfoPage'),
      name: 'HILInfoPage',
      hidden: true,
      meta: { title: 'HILInfoPage', noCache: true,roles: ['研发'] }
    }
  ]
}

export default HIL
