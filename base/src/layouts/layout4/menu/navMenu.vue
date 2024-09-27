<template>
  <div id="dms-navMenu" v-show="subMenu.length > 0">
    <!-- <el-menu :default-active="defaultActive" :router="true" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose" :collapse="isCollapse">
      <el-menu-item v-for="(sub_item,sub_index) in subMenu" :key="sub_index" :index="sub_item.path" @click="setPath(sub_item)">{{generateTitle(sub_item.meta.title,sub_item.meta)}}</el-menu-item>
    </el-menu> -->
    <el-menu :default-active="$route.path" :router="true" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose" :collapse="isCollapse" :default-openeds="opends">
      <template v-for="(subMenuItem,sub_index) in subMenu" >
        <el-submenu :key="sub_index"  :index="subMenuItem.index" v-if="subMenuItem.type === 'elSubmenu'">
          <template slot="title">
            <i class="el-icon-document"></i>
            <span slot="title" class="submenuTitle" :title="subMenuItem.title">{{ subMenuItem.title }}</span>
          </template>
          <el-menu-item 
            v-for="(subMenuItemData, subMenuIndex) in subMenuItem.menuItem" 
            :key="subMenuIndex"  :index="subMenuItemData.index"
            @click="setPath(subMenuItemData)">{{ subMenuItemData.title }}</el-menu-item>
        </el-submenu>
        <el-menu-item 
          v-if="subMenuItem.type === 'elMenuItem'"
          :key="sub_index" :index="subMenuItem.index"
          @click="setPath(subMenuItem)">
          <template slot="title">
            <i class="el-icon-document" style="color: #909399;"></i>
            <span slot="title" class="submenuTitle" :title="subMenuItem.title">{{ subMenuItem.title }}</span>
          </template>
        </el-menu-item>
      </template>
    </el-menu>
    <i class="el-icon-menu navMenu-icon" @click="setIsCollapse"></i>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { generateTitle } from '@/utils/i18n'
import Cookies from 'js-cookie'
export default {
  props:{
    activeRouter:{
      type:String
    }
  },
  data() {
    return {
      isCollapse: false,
      // defaultActive:'',
      subMenu: [],
      opends: ['1']
    };
  },
  computed: {
    ...mapGetters([
      'menuList'
    ])
  },
  watch:{
    activeRouter(n,o){
      this.getAllMenu()
    },
    '$i18n.locale'(newValue) {
      this.getAllMenu()
    }
  },
  created(){
    // this.defaultActive = this.$route.path
    this.getAllMenu()
  },
  methods: {
    setIsCollapse() {
      this.isCollapse = !this.isCollapse
    },
    setPath(item){
      console.log(this.defaultActive,'this.defaultActive')
    },
    getAllMenu() {
      // const frontendArray = Cookies.get('frontendArray').split(',')
      // // this.subMenu = this.menuList.map(it => it.children).flat()
      // this.subMenu = this.menuList.filter(it => frontendArray.includes(it.meta.policy)).map(it => it.children).flat()
      
      // @wodelu: TODO-菜单权限
      if (window.location.pathname.indexOf('dmsshell') > -1) {
        this.subMenu = [{
          index: '1',
          title: this.$t(`Menu['访问管理']`),
          type: 'elSubmenu',
          menuItem: [
            {
              index: '/dmsshell/userlist',
              title: this.$t(`Menu['用户']`),
            },
            {
              index: '/dmsshell/rolelist',
              title: this.$t(`Menu['角色']`),
            },
            {
              index: '/dmsshell/policies',
              title: this.$t(`Menu['策略']`),
            }
          ]
        }]
      } else if (window.location.pathname.indexOf('governance') > -1) {
        this.subMenu = [{
          index: '/governance/overview',
          title: this.$t(`common['简介']`),
          type: 'elMenuItem',
        },{
          index: '/governance/tasks',
          title: this.$t(`Menu['治理任务']`),
          type: 'elMenuItem',
        },{
          index: '/governance/proposals',
          title: this.$t(`Menu['治理方案']`),
          type: 'elMenuItem',
        },{
          index: '/governance/triggers',
          title: this.$t(`Menu['触发器']`),
          type: 'elMenuItem',
        }]
      } else if (window.location.pathname.indexOf('dataasset') > -1) {
        this.subMenu = [
          {
          index: '/dataasset/overview',
          title: this.$t(`Menu['数据总览']`),
          type: 'elMenuItem',
          },
          {
          index: '/dataasset/search',
          title: this.$t(`Menu['数据搜索']`),
          type: 'elMenuItem',
        }]
      } else if (window.location.pathname.indexOf('algorithem') > -1) {
        this.subMenu = [
          {
            index: '/algorithem/algorithempanel',
            title: this.$t(`Menu['资源面板']`),
            type: 'elMenuItem',
          },
          {
            index: '/algorithem/lists',
            title: this.$t(`Menu['算法列表']`),
            type: 'elMenuItem',
          },
          {
            index: '/algorithem/layers',
            title: this.$t(`Menu['依赖层']`),
            type: 'elMenuItem',
          },
          {
            index: '/algorithem/envs',
            title: this.$t(`Menu['环境']`),
            type: 'elMenuItem',
          }
        ]
      } else {
        this.subMenu = []
      }
    },
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    generateTitle
  }
}
</script>

<style lang="scss">
#dms-navMenu{
  // width: 200px;
  min-height: 400px;
  .el-menu-vertical-demo {
    height: 100%;

    .el-submenu__title {
      display: flex;
      align-items: center;
    }

    .el-menu-item.is-active {
      color: #FF7900;
    }

    .submenuTitle {
      text-overflow: ellipsis;
      overflow: hidden;
      word-break: break-all;
      white-space: nowrap;
    }
  }
  .navMenu-icon {
    bottom: 20px;
    position: absolute;
    font-size: 24px;
    left: 20px;
    cursor: pointer;
  }

  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    min-height: 400px;
  }
}
</style>
