import { createRouter, createWebHistory } from 'vue-router'
import Indexpage from '../components/Collection/Indexpage/Component.vue'
import Visualtoolpage from '../components/Collection/Visualtoolpage/Component.vue'
import Detailspage from '../components/Collection/Detailspage/Component.vue'
import CaliPage from '../components/Collection/caliPage/Component.vue'
import configsPage from '../components/Collection/configsPage/Component.vue'
import createConfigPage from '../components/Collection/createConfigPage/Component.vue'
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
          component: Indexpage
        },
        {
          path: 'root/visualtool',
          component: Visualtoolpage
        },
        {
          path: 'datasetdetail/:id',
          component: Detailspage
        },
        {
          path: 'datasetdetail/:datasetid/:calitemplateid',
          component: CaliPage
        },
        {
          path: 'root/configs',
          component: configsPage
        },
        {
          path: 'root/createConfig',
          component: createConfigPage
        },
      ]
    }

  ]
})
export default router