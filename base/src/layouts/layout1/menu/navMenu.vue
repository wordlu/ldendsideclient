<template>
  <div
    id="dms-navMenu"
    v-show="subMenu.length > 0"
  >
    <el-menu
      :default-active="$route.path"
      :router="true"
      class="el-menu-vertical-demo"
      @open="handleOpen"
      @close="handleClose"
      :collapse="isCollapse"
      :default-openeds="opends"
    >
      <template v-for="(subMenuItem, sub_index) in subMenu">
        <el-submenu
          :key="sub_index"
          :index="subMenuItem.index"
          v-if="subMenuItem.type === 'elSubmenu'"
        >
          <template slot="title">
            <!-- <i class="el-icon-document"></i> -->
            <img
              class="navicon"
              :src="require('@/assets/navicon.svg')"
              alt=""
            />
            <span
              slot="title"
              class="submenuTitle"
              :title="subMenuItem.title"
            >{{ subMenuItem.title }}</span>
          </template>
          <el-menu-item
            v-for="(subMenuItemData, subMenuIndex) in subMenuItem.menuItem"
            :key="subMenuIndex"
            :index="subMenuItemData.index"
            @click="setPath(subMenuItemData)"
          >{{ subMenuItemData.title }}</el-menu-item>
        </el-submenu>
        <el-menu-item
          v-if="subMenuItem.type === 'elMenuItem'"
          :key="sub_index"
          :index="subMenuItem.index"
        >
          <template slot="title">
            <img
              class="navicon"
              :src="require('@/assets/navicon.svg')"
              alt=""
            />
            <span
              slot="title"
              class="submenuTitle"
              :title="subMenuItem.title"
            >{{ subMenuItem.title }}</span>
          </template>
        </el-menu-item>
      </template>
    </el-menu>
    <!-- <i class="el-icon-menu navMenu-icon" @click="setIsCollapse"></i> -->
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { generateTitle } from "@/utils/i18n";
import Cookies from "js-cookie";
import axios from 'axios';
// import { func_gts_ingress } from "@/api/ingress"

export default {
  props: {
    activeRouter: {
      type: String,
    }
  },
  data () {
    return {
      isCollapse: false,
      // defaultActive:'',
      subMenu: [],
      opends: ["1"],
      ingressValue: ""
    };
  },
  computed: {
    ...mapGetters(["menuList"]),
  },
  watch: {
    activeRouter (n, o) {
      this.getAllMenu();
    },
    "$i18n.locale" (newValue) {
      this.getAllMenu();
    },
  },
  created () {
    // this.defaultActive = this.$route.path
    this.getAllMenu();
  },
  methods: {
    setIsCollapse () {
      this.isCollapse = !this.isCollapse;
    },
    setPath (item) {
    },
    async getAllMenu () {
      // const data = await func_gts_ingress()
      // this.ingress = data.data[0] ? data.data[0]['attributes']['ingress'] : ''
      // if (this.ingress) {
      //   this.ingressValue = this.ingress.split('://')[1].split('.')[0]
      // }

      // @wodelu: TODO-菜单权限
      // if (window.location.pathname.indexOf("loggerfe") > -1) {
        this.subMenu = [{
          index: '/systemanage/sysmanage',
          title: '概览',
          type: 'elMenuItem',
          policy: "menusceneLibraryProject",
        },
        {
          index: '/datastore/storage',
          title: '存储管理',
          type: 'elMenuItem',
          policy: "menusceneLibraryProjectdatastore",
        },
        {
          index: '3',
          title: '数据集',
          type: 'elSubmenu',
          policy: "menusceneLibraryProjectdataasset",
          menuItem: [
            // {
            //   index: '/governance/tasks',
            //   title: '数据治理',
            //   policy: "pagesceneLibraryProjectGovernancetasks",
            // },
            {
              index: '/sceneLibraryProject/governancetasks',
              title: '数据治理',
              policy: "pagesceneLibraryProjectGovernancetasks",
            },
            // {
            //   index: `/project/dataSetList/${this.ingressValue}?reqip=${this.ingress}`,
            //   title: '数据资产',
            //   policy: "pagesceneLibraryProjectDataassetsearch",
            // }
          ]
        },
        {
          index: '4',
          title: '场景库',
          type: 'elSubmenu',
          policy: "menuoperation",
          menuItem: [
            // {
            //   index: `/project/sceneLibList/${this.ingressValue}?reqip=${this.ingress}`,
            //   title: '场景',
            //   policy: "pageoperationlines",
            // },
            {
              index: '/sceneLibraryProject/tasklists',
              title: '任务',
              policy: "pageoperationdispatchs",
            }
          ]
        }
        ]
      // }
      // else {
      //   this.subMenu = []
      // }
    },
    handleOpen (key, keyPath) {
      // console.log(key, keyPath);
    },
    handleClose (key, keyPath) {
      // console.log(key, keyPath);
    },
    generateTitle,
  },
};
</script>

<style lang="scss">
#dms-navMenu {
  // width: 200px;
  min-height: 400px;
  .el-menu-vertical-demo {
    height: 100%;
    border-right: none;

    .navicon {
      width: 6px;
      height: 12px;
      margin-right: 4px;
    }

    .el-submenu__title {
      display: flex;
      align-items: center;
    }

    .el-menu-item.is-active {
      color: #FF7900;
      background: #FFF1E5;
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
    width: 210px;
    min-height: 400px;
    overflow: auto;
    padding-bottom: 100px;
  }

  .el-submenu__title {
    font-family: PingFang SC;
    font-size: 14px;
    font-weight: 600;
    line-height: 22px;
    text-align: left;
  }

  .el-menu-item {
    font-family: PingFang SC;
    font-size: 14px;
    font-weight: 400;
    // line-height: 22px;
    text-align: left;
  }
}
</style>
