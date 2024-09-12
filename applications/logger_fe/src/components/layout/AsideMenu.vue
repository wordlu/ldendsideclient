<!-- 左侧侧边栏 -->
<template>
  <div class="loggerfe">
    <!-- 是否展开按钮 -->
    <div class="toggle-button" @click="isCollapse = !isCollapse">|||</div>
    <!-- 菜单区 -->
    <el-menu
      
      :key="visualizeStore.activePath"
      :default-active="visualizeStore.activePath"
      :class="{ collapsed: isCollapse }"
      :collapse="isCollapse"
      :unique-opened="true"
      :collapse-transition="false"
      router
      @select="selectMenu">
      <component
        :is="item.children ? ElSubMenu : ElMenuItem"
        v-for="item in props.menuList"
        :key="item.index"
        :index="item.index">
        <Icon v-if="!item.children" class="text-2xl" :icon="item.icon" />
        <template #title>
          <Icon v-if="item.children" class="text-2xl" :icon="item.icon" />
          <span class="ml-3">{{ item.name }}</span>
        </template>
        <template v-if="item.children">
          <component
            :is="subItem.children ? ElSubMenu : ElMenuItem"
            v-for="subItem in item.children"
            :key="subItem.index"
            :index="subItem.index">
            <template #title>{{ subItem.name }}</template>
            <el-menu-item v-for="child in subItem.children" :key="child.index" :index="child.index">
              {{ child.name }}
            </el-menu-item>
          </component>
        </template>
      </component>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
export interface MenuItem {
  index: string
  icon?: string
  name: string
  children?: Array<MenuItem>
}
import { ref } from 'vue'
import { ElMenuItem, ElSubMenu } from 'element-plus'
import { Icon } from '@iconify/vue'
import { useVisualizeStore } from '@/store/modules/visualize'
import { setCollectionStatus } from '@/api/s1/collect'

// 定义属性
interface Props {
  menuList: Array<MenuItem>
}
const props = defineProps<Props>()
const visualizeStore = useVisualizeStore()

const isCollapse = ref<boolean>(false) // 菜单是否折叠

const selectMenu = (index: string) => {
  // visualizeStore.activePath = ''
  // 切换路由时,如果切出可视化页面,则停止推送
  if (index !== '/visualization') {
    // const lidars = visualizeStore.selLidars || [],
    //   cameras = visualizeStore.selCameras || []
    // // 当存在订阅的雷达或者相机设备时
    // if (cameras.length > 0 || lidars.length > 0) {
    //   const names = cameras.concat(lidars)
    setCollectionStatus({
      status: 'stop_view',
    })
    visualizeStore.showPoint = true
    visualizeStore.closeVisualization()
    // }
  }
}
</script>

<style scoped lang="scss">
.loggerfe {
  .main-container {
    height: calc(100% - 60px);
    overflow: hidden;
    width: 100%;
  }
  .my-icon {
    // color: $text-color1;
    font-size: 25px;
  }

  .el-menu {
    border-right: none;
    &.collapsed {
      width: 4rem;
    }
  }

  .el-menu-vertical:not(.el-menu--collapse) {
    width: 200px;
    min-height: 400px;

    .menu-label {
      padding-left: 10px;
    }
  }
  .el-sub-menu .el-menu-item {
    min-width: auto;
  }

  .toggle-button {
    // background-color: $bg-color;
    font-size: 10px;
    line-height: 24px;
    // color: $text-color1;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
}

</style>

<style lang="scss">
.el-menu.collapsed .el-sub-menu__title {
  padding-right: 0;
}
</style>
