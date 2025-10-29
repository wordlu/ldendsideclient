<template>
  <div id="ld-navMenu">
    <el-menu :default-active="defaultActive" :router="true" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose" :collapse="isCollapse">
      <el-menu-item v-for="(sub_item,sub_index) in subMenu" :key="sub_index" :index="sub_item.path" @click="setPath(sub_item)">{{generateTitle(sub_item.meta.title,sub_item.meta)}}</el-menu-item>
    </el-menu>
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
      defaultActive:'',
      subMenu: []
    };
  },
  computed: {
    ...mapGetters([
      'menuList'
    ])
  },
  created(){
    this.defaultActive = this.$route.path
    this.getAllMenu()
  },
  methods: {
    setPath(item){
      console.log(this.defaultActive,'this.defaultActive')
    },
    getAllMenu() {
      const frontendArray = Cookies.get('frontendArray').split(',')
      // this.subMenu = this.menuList.map(it => it.children).flat()
      this.subMenu = this.menuList.filter(it => frontendArray.includes(it.meta.policy)).map(it => it.children).flat()
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
#ld-navMenu{
  width: 200px;
  min-height: 400px;
  .el-menu-vertical-demo {
    height: 100%;
  }
  .el-menu{
    width: 200px;
  }
}
</style>
