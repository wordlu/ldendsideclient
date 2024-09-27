import { createRouter, createWebHistory } from 'vue-router'
import SysmanagePage from '../components/Systemanage/sysmanage/Component.vue'
import SystemMonitorPage from '../components/Systemanage/SystemMonitor/Component.vue'
import StatusMonitorPage from '../components/Systemanage/StatusMonitor/Component.vue'
import LogsAnalyzePage from '../components/Systemanage/LogsAnalyze/Component.vue'
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
      path: '/systemanage',
      component: layout,
      children: [
        {
          path: 'sysmanage',
          component: SysmanagePage
        },
        {
          path: 'devices',
          component: SystemanageDevicesPage
        },
        {
          path: 'drives',
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
        },
        {
          path: 'systemmonitor',
          component: SystemMonitorPage
        },
        {
          path: 'statusmonitor',
          component: StatusMonitorPage
        },
        {
          path: 'logsanalyze',
          component: LogsAnalyzePage
        }
      ]
    }

  ]
})
export default router