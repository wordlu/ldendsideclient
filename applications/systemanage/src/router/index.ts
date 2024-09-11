import { createRouter, createWebHistory } from 'vue-router'
import SysmanagePage from '../components/Systemanage/sysmanage/Component.vue'
import SystemanageDevicesPage from '../components/Systemanage/devices/Component.vue'
import SystemanageDevicesDrivesPage from '../components/Systemanage/devicesdrives/Component.vue'
import SystemanageTaskCreation from '../components/Systemanage/GovTaskCreation/Component.vue'
import SystemanageProposals from '../components/Systemanage/GovProposal/Component.vue'
import collectiontemplatesPage from '../components/Systemanage/collectiontemplates/Component.vue'
import SystemanageProposalDetail from '../components/Systemanage/GovProposalDetail/Component.vue'
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
          component: collectiontemplatesPage
        },
        {
          path: 'tags',
          component: collectiontemplatesPage
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