<template>
  <div
    id="dms-navMenu"
    v-show="subMenu.length > 0"
  >
    <el-menu
      :default-active="currentPath"
      :router="true"
      class="el-menu-vertical-demo"
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
            <img class="navicon" :src="require('@/assets/navicon.svg')"/>
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
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Cookies from "js-cookie";
import axios from 'axios';

export default {
  props: {
    activeRouter: {
      type: String,
    }
  },
  data () {
    return {
      isCollapse: false,
      subMenu: [],
      opends: ["1"],
      ingressValue: "",
      currentPath: ""
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
    "$route.path": {
      handler(newPath, oldpath) {
        if (newPath === "/loggerfe/root/createConfig") {
          this.currentPath = "/loggerfe/root/configs";
        } else if(newPath.indexOf('/loggerfe/datasetdetail') > -1) {
          this.currentPath = "/systemanage/storages";
        } else {
          this.currentPath = newPath;
        }
      },
      immediate: true,
    },
  },
  created () {
    this.getAllMenu();
  },
  methods: {
    setIsCollapse () {
      this.isCollapse = !this.isCollapse;
    },
    async getAllMenu () {
      if (this.$route.path === "/loggerfe/root/index" || this.$route.path === "/loggerfe/root/visualtool") {
        this.subMenu = []
      } else if(this.$route.query && this.$route.query.logger && this.$route.query.logger === 'trash') {
        this.subMenu = [
          {
            index: '1',
            title: '系统管理',
            type: 'elSubmenu',
            policy: "menuSystemanage",
            menuItem: [
              {
                index: '/systemanage/drives?logger=trash',
                title: '设备驱动管理',
                policy: "pagesystemanagedrives",
              },
              {
                index: '/systemanage/tags?logger=trash',
                title: '标签管理',
                policy: "pagesystemanagetags",
              },
              {
                index: '/systemanage/collectiontemplates?logger=trash',
                title: '采集模版管理',
                policy: "pagesystemanagecollectiontemplates",
              },
              // {
              //   index: '/systemanage/calitemplates?logger=trash',
              //   title: '标定流程管理',
              //   policy: "pagesystemanagecalitemplates",
              // }
            ]
          }
        ]
      } else {
        this.subMenu = [
          {
            index: '1',
            title: '系统管理',
            type: 'elSubmenu',
            policy: "menuSystemanage",
            menuItem: [
              {
                index: '/loggerfe/root/configs',
                title: '采集配置',
                policy: "pageloggerfeconfigs",
              },
              // {
              //   index: '/systemanage/devices',
              //   title: '设备管理',
              //   policy: "pagesystemanagedevices",
              // },
              {
                index: '/systemanage/storages',
                title: '存储管理',
                policy: "pagesystemanagestorages",
              },
              {
                index: '/systemanage/sysmanage',
                title: '系统环境',
                policy: "pagesystemanagesysmanage",
              },
            ]
          },
          {
            index: '/loggerfe/root/index',
            title: '采集',
            type: 'elMenuItem',
            policy: "menuloggerfeindex",
          },
          {
            index: '3',
            title: '监控',
            type: 'elSubmenu',
            policy: "menumonitor",
            menuItem: [
              {
                index: '/systemanage/systemmonitor',
                title: '系统监控',
                policy: "pagesystemmonitor",
              },
              {
                index: '/systemanage/statusmonitor',
                title: '事件监控',
                policy: "pagestatusmonitor",
              },
              {
                index: '/systemanage/logsanalyze',
                title: '日志分析',
                policy: "pagelogsanalyze",
              },
            ]
          }
        ]
      }
      
    },
  },
};
</script>

<style lang="scss">
#dms-navMenu .el-menu-vertical-demo:not(.el-menu--collapse) {
  min-width: 216px;
}
#dms-navMenu {
  width: 216px;
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
