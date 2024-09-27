/* 存储图标集,离线使用 */
import { addCollection } from '@iconify/vue'
import iconCollection from './icons'

iconCollection.forEach(collection => {
  addCollection(collection)
})
