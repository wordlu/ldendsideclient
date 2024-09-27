import Layout from '@/layout'

const canvasChart = {
  path: '/canvasChart',
  component: Layout,
  name: 'canvasChart',
  redirect: '/chart',
  meta: {
    title: 'chart',
    roles: ['研发','销售'],
    icon: 'analysis'
  },
  children: [
    {
      path: 'index',
      component: () => import('@/views/canvasChart/index'),
      name: 'index',
      meta: { title: 'canvasChart', noCache: true,roles: ['研发','销售'] }
    }
  ]
}

export default canvasChart