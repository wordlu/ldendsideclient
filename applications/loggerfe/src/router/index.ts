import { createRouter, createWebHistory } from 'vue-router'
import Indexpage from '../components/Systemanage/Indexpage/Component.vue'
import configsPage from '../components/Systemanage/configsPage/Component.vue'
import storagesPage from '../components/Systemanage/storages/Component.vue'
import createConfigPage from '../components/Systemanage/createConfigPage/Component.vue'
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
          component: Indexpage
        },
        {
          path: 'root/configs',
          component: configsPage
        },
        {
          path: 'root/createConfig',
          component: createConfigPage
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