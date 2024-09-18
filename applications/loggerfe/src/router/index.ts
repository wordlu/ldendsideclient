import { createRouter, createWebHistory } from 'vue-router'
import SysmanagePage from '../components/Systemanage/sysmanage/Component.vue'
import SystemanageDevicesPage from '../components/Systemanage/devices/Component.vue'
import storagesPage from '../components/Systemanage/storages/Component.vue'
import SystemanageDevicesDrivesPage from '../components/Systemanage/devicesdrives/Component.vue'
import tagLibListPage from '../components/Systemanage/tagLibrary/taglist.vue'
import collectiontemplatesPage from '../components/Systemanage/collectiontemplates/Component.vue'
import layout from '../layout/Component.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/loggerfe',
      component: layout,
      children: [
        {
          path: 'root/index',
          component: SysmanagePage
        },
        {
          path: 'root/configs',
          component: SystemanageDevicesPage
        },
        {
          path: 'root/createConfig',
          component: SystemanageDevicesDrivesPage
        },
        {
          path: 'storages',
          component: storagesPage
        },
        {
          path: 'tags',
          component: tagLibListPage
        },
        {
          path: 'collectiontemplates',
          component: collectiontemplatesPage
        }
      ]
    }

  ]
})
export default router