import { createRouter, createWebHistory } from 'vue-router'
import GovernanceOverview from '../components/Governance/GovOverview/Component.vue'
import GovernanceTasks from '../components/Governance/GovTask/Component.vue'
import GovernanceTaskDetail from '../components/Governance/GovTaskDetail/Component.vue'
import GovernanceTaskCreation from '../components/Governance/GovTaskCreation/Component.vue'
import GovernanceProposals from '../components/Governance/GovProposal/Component.vue'
import GovernanceTriggers from '../components/Governance/GovTrigger/Component.vue'
import GovernanceProposalDetail from '../components/Governance/GovProposalDetail/Component.vue'
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
          component: GovernanceTasks
        },
        {
          path: 'overview',
          component: GovernanceOverview
        },
        {
          path: 'taskcreation',
          component: GovernanceTaskCreation
        },
        {
          path: 'task/:id',
          component: GovernanceTaskDetail
        },
        {
          path: 'proposals',
          component: GovernanceProposals
        },
        {
          path: 'proposal/:id',
          component: GovernanceProposalDetail
        },
        {
          path: 'triggers',
          component: GovernanceTriggers
        }
      ]
    }

  ]
})
export default router