import { createRouter, createWebHistory } from 'vue-router'
import layout from '../layout/index.vue';
import visualization from '../view/visualization/index.vue'
import thumbnailsvisualization from '../view/thumbnailsvisualization/index.vue'

const routes = [
  {  path: '/' , redirect: '/visualization' },
  {
    path: '/visualization',
    name: 'visualization',
    component:visualization,
  },
  {
    path: '/thumbnailsvisualization',
    name: 'thumbnailsvisualization',
    component:thumbnailsvisualization,
  }
]
const router = createRouter({
  history: createWebHistory('/pointcloud'),
  routes
})

export default router;