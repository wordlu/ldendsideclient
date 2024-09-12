import { createRouter, createWebHistory } from 'vue-router'
import DeviceRoutes from './devices'
// export const Layout = () => import('@/views/Layout.vue')
import Layout from '@/views/Layout.vue'
import mainlayout from '../layout/Component.vue'
import indexpage from '@/views/Index.vue'
import indexpage1 from '@/views/Index1.vue'
import visualizationPage from '@/views/Visualization.vue'
import SystemmanagePage from '@/views/SystemManage.vue'
import aboutnativePage from '@/views/AboutNative.vue'
import SystemInfoPage from '@/views/SystemInfo.vue'
import agreementPage from '../views/Agreement.vue'

const routes = [
  {
    path: '/loggerfe',
    component: mainlayout,
    children: [
      {
        // name: 'root',
        path: 'root',
        component: Layout,
        children: [
          {
            path: 'index',
            component: indexpage,
          },
          {
            path: 'index1',
            component: indexpage,
          },
          {
            // 图像可视化页面
            path: 'visualization',
            component: visualizationPage,
          },
          {
            // 系统管理首页
            path: 'system_manage',
            component: SystemmanagePage,
          },
          {
            // 关于本机页面
            path: 'aboutnative',
            component: aboutnativePage,
          },
          ...DeviceRoutes,
          {
            // 标签配置页面
            name: 'tag_index',
            path: '/tag_index',
            component: () => import('@/views/TagIndex.vue'),
          },
          // {
          //   // 自动打标策略配置页面
          //   name: 'tag_auto',
          //   path: '/tag_auto',
          //   component: () => import('@/views/TagAutoConfig.vue'),
          // },
          {
            // 系统信息页面
            path: 'system_info',
            component: SystemInfoPage,
          },
        ],
      },
      {
        path: 'index',
        component: indexpage,
      },
      {
        path: 'agreement',
        component: agreementPage,
      },
      {
        // 设备注册页 - 配置模板预览页面
        path: '/template_preview',
        name: 'template_preview',
        component: () => import('@/views/devices/register/Preview.vue'),
      },
    ],
  }
]


const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = String(to.meta.title)
  }
  next()
})

export default router
