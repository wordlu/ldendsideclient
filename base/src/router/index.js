import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
// saic02account
import Layout from '@/layout'

export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/SystemSelection',
    component: () => import('@/views/SystemSelection/SystemSelection'),
    hidden: true
  },
  {
    path: '/forget/emil',
    component: () => import('@/views/forget/forget'),
    hidden: true
  },
  {
    path: '/forget/password',
    component: () => import('@/views/forget/forget'),
    hidden: true
  },
  // {
  //   path: '/',
  //   component: Layout,
  //   redirect: '/main/home',
  //   hidden:true,
  //   children: [
  //     {
  //       path: '/main/home',
  //       component: () => import('@/views/dashboard/index'),
  //       name: 'home',
  //       meta: { title: 'home', icon: 'home', affix: true }
  //     }
  //   ]
  // },
  {
    path:'/main',
    component: Layout,
    redirect: '/main/user/permissionRoleManage/role',
    hidden:true,
    children: [
      {
        path: '/main/user/permissionRoleManage/user',
        component: () => import('@/views/user/user'),
        name: 'user',
        meta: { title: 'user', icon: 'home', affix: false }
      },
      {
        path: '/main/user/permissionRoleManage/role',
        component: () => import('@/views/role/role'),
        name: 'role',
        meta: { title: 'role', icon: 'home', affix: false }
      },
      {
        path: '/main/user/permissionRoleManage/roleInfo/:id',
        component: () => import('@/views/role/roleInfo'),
        name: 'roleInfo',
        hidden:true,
        meta: { title: 'roleDetail', icon: 'home', affix: false }
      },
      {
        path: '/main/user/permissionRoleManage/permissions',
        component: () => import('@/views/permissions/permissions'),
        name: 'permissions',
        meta: { title: 'permissions', icon: 'home', affix: false }
      }
    ]
  },
  {
    path:'/permissionRoleManage',
    component: Layout,
    redirect: '/permissionRoleManage/user',
    hidden:true,
    children: [
      {
        path: '/permissionRoleManage/user',
        component: () => import('@/views/user/user'),
        name: 'user',
        meta: { title: 'user', icon: 'home', affix: false }
      },
      {
        path: '/permissionRoleManage/role',
        component: () => import('@/views/role/role'),
        name: 'role',
        meta: { title: 'role', icon: 'home', affix: false }
      },
      {
        path: '/permissionRoleManage/roleInfo/:id',
        component: () => import('@/views/role/roleInfo'),
        name: 'roleInfo',
        hidden:true,
        meta: { title: 'roleDetail', icon: 'home', affix: false }
      },
      {
        path: '/permissionRoleManage/permissions',
        component: () => import('@/views/permissions/permissions'),
        name: 'permissions',
        meta: { title: 'permissions', icon: 'home', affix: false }
      }
    ]
  },
  {
    path:'/dailyReport-role',
    component: Layout,
    redirect: '/dailyReport-role/index',
    meta: { affix: false , noCache:true },
    hidden:true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/dailyReport'),
        name: 'dailyReport-role',
        meta: { title: 'dailyReport-role', icon: 'dailyReport-role', affix: false , noCache:true }
      }
    ]
  },
  // { path: '*',  redirect: '/404', hidden: true }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  // 404 page must be placed at the end !!!
  { path: '*',  redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
