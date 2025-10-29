import Layout from '@/layout'

const ObjectLibrary = {
  path: '/ObjectLibrary',
  component: Layout,
  name: 'ObjectLibrary',
  redirect: '/ObjectLibrary/search',
  meta: {
    title: 'ObjectLibrary',
    icon: 'analysis',
    roles: ['市场','销售','研发','客户','数据平台']
  },
  children: [
    // {
    //   path: 'index',
    //   component: () => import('@/views/ObjectLibrary/index'),
    //   name: 'ObjectLibrary-index',
    //   meta: { title: 'ObjectLibrary-index',noCache: true,roles: ['市场','销售','研发','客户','数据平台'] }
    // },
    {
      path: 'search',
      component: () => import('@/views/ObjectLibrary/search'),
      name: 'ObjectLibrary_search',
      meta: { title: 'ObjectLibrary_search', noCache: true,roles: ['市场','销售','研发','客户','数据平台'] }
    },
    {
      path: 'management',
      component: () => import('@/views/ObjectLibrary/management'),
      name: 'ObjectLibrary_management',
      meta: { title: 'ObjectLibrary_management', noCache: true,roles: ['市场','销售','研发','客户','数据平台'] }
    }
  ]
}

export default ObjectLibrary