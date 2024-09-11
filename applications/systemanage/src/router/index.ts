import { createRouter, createWebHistory } from 'vue-router'
import SysmanagePage from '../components/Systemanage/sysmanage/Component.vue'
import SystemanageTasks from '../components/Systemanage/GovTask/Component.vue'
import SystemanageTaskDetail from '../components/Systemanage/GovTaskDetail/Component.vue'
import SystemanageTaskCreation from '../components/Systemanage/GovTaskCreation/Component.vue'
import SystemanageProposals from '../components/Systemanage/GovProposal/Component.vue'
import SystemanageTriggers from '../components/Systemanage/GovTrigger/Component.vue'
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
          component: SystemanageTasks
        },
        {
          path: 'drives',
          component: SystemanageTaskCreation
        },
        {
          path: 'storages',
          component: SystemanageTriggers
        },
        {
          path: 'tags',
          component: SystemanageTriggers
        },
        {
          path: 'collectiontemplates',
          component: SystemanageTriggers
        }
      ]
    }

  ]
})
export default router