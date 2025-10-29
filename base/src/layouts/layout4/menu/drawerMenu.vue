<template>
  <div id="dms-drawerMenu">
    <!-- <el-button icon="el-icon-menu" " size="medium"></el-button> -->
    <i class="el-icon-s-unfold drawer-icon" @click="drawerClick" v-show="drawer == false"></i>
    <i class="el-icon-s-fold drawer-icon"  @click="drawer = false" v-show="drawer == true"></i>    
    <div class="border-right"></div>
    <el-drawer
      class="menu-drawer"
      :with-header="false"
      :visible.sync="drawer"
      :direction="direction"
      :size="672"
      :modal="false"
      :before-close="handleClose">
      <div class="container">
        <div class="col">
          <div class="category-item" v-for="category in filterActions(categoryArray)" :key="category.title">
            <div class="title">{{ category.title }}</div>
            <div class="products">
              <div class="item "  v-for="item in category.productArray" :key="item.title" @click="clickdrawerMenu(item.url)">
                <div class="info">
                  <i class="el-icon-first-aid-kit"></i>
                  <el-tooltip :content="item.title" placement="bottom" effect="light">
                    <span class="product-name">{{ item.title }}</span>
                  </el-tooltip>
                </div>
                <i class="el-icon-right"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import Cookies from 'js-cookie'
export default {
  data(){
    return{
      drawer: false,
      direction: 'ltr',
    }
  },
  created(){
  },
  computed: {
    categoryArray() {
      return [
        {
          title: this.$t(`common['首页']`),
          menu_policy: 'menuhomepage',
          productArray: [{
            title: this.$t(`Menu['概览']`),
            menu_policy: 'menulanding',
            url: '/landing/landing'
          }]
        }, {
          title: this.$t(`Menu['系统管理']`),
          menu_policy: 'menusystemmanagement',
          productArray: [
          // {
          //   title: '工作空间列表',
          //   url: '/landing/spaces'
          // }, 
          {
            title: this.$t(`Menu['项目列表']`),
            menu_policy: 'menulandingprojects',
            url: '/landing/projects'
          }, {
            title: this.$t(`Menu['权限管理']`),
            menu_policy: 'menudmsshelluserlist',
            url: '/dmsshell/userlist'
          }]
        }, {
          title: this.$t(`Menu['数据治理']`),
          menu_policy: 'menudatagovernance',
          productArray: [{
            title: this.$t(`Menu['存储管理']`),
            menu_policy: 'menudatastorestorage',
            url: '/datastore/storage'
          }, {
            title: this.$t(`Menu['标签管理']`),
            menu_policy: 'menutagLibrarytagLibList',
            url: '/tagLibrary/tagLibList'
          }, {
            title: this.$t(`Menu['治理集成']`),
            menu_policy: 'menugovernanceoverview',
            url: '/governance/overview'
          }, {
            title: this.$t(`Menu['数据资产管理']`),
            menu_policy: 'menudataassetoverview',
            url: '/dataasset/overview'
          }]
        }, {
          title: this.$t(`Menu['算法/模型研发']`),
          menu_policy: 'menualgorithemresearch',
          productArray: [{
            title: this.$t(`Menu['算法库研发']`),
            menu_policy: 'menualgorithemalgorithempanel',
            url: '/algorithem/algorithempanel'
          },{
            title: this.$t(`Menu['数据编织空间研发']`),
            menu_policy: 'menulandingwovespaces',
            url: '/landing/wovespaces'
          },{
            title: this.$t(`Menu['数据项目研发']`),
            menu_policy: 'menulandingdataprojects',
            url: '/landing/dataprojects'
          }]
        },
        {
          title: '端侧基线产品',
          menu_policy: 'menualgorithemresearch',
          productArray: [
          
          {
            title: '采集系统',
            menu_policy: 'menulandingwovespaces',
            url: '/loggerfe/root/index'
          },
          {
            title: '可视化系统',
            menu_policy: 'menulandingdataprojects',
            url: '/ldvizfe/home'
          },
          {
            title: '标定系统',
            menu_policy: 'menualgorithemalgorithempanel',
            url: '/ldcalibration/lidar_cali/lidar'
          },]
        },
      ]
    }
  },
  methods:{
    filterActions(categoryArray) {
      const shellfrontendArray = Cookies.get('shellfrontendArray')
      if (shellfrontendArray) {
        const targetPolicies = shellfrontendArray.split(',')
        const filteredData = categoryArray.map(item => ({
          ...item,
          productArray: item.productArray.filter(product => targetPolicies.includes(product.menu_policy))
        })).filter(item => item.productArray.length > 0);
        return filteredData;
      }
      return []
    },
    Language() {
      if (this.$i18n.locale === 'zh') {
        this.$i18n.locale = 'en'
        localStorage.setItem('lang', 'en')
      } else {
        this.$i18n.locale = 'zh'
        localStorage.setItem('lang', 'zh')
      }
    },
    clickdrawerMenu(url) {
      window.history.pushState(null,'',url)
      this.drawer = false
    },
    handleClose() {
      console.log("close drawer")
      this.drawer = false
    },
    drawerClick() {
      const account = Cookies.get('account')
      if (account !== "liangdao.demo") this.drawer = true
    },
  }
}
</script>
<style lang="scss">
#dms-drawerMenu {
  display: flex;

  .drawer-icon {
    margin-right: 10px;
    font-size: 24px;
    color: #FF7900;
    cursor: pointer;
  }

  .border-right {
    width: 1px;
    height: 24px;
    background: #E1E3EB;
    margin-right: 16px;
  }

  .menu-drawer {

    .el-drawer__open .el-drawer.ltr {
      border: solid 1px var(--el-menu-border-color);
      border-radius: 0px 12px 12px 0px;
      background: #2D2F39;
    }

    .container {
      width: 100%;
      height: calc(100% - 28px);
      padding: 0 20px 30px;
      box-sizing: border-box;
      border: none;
    }

    .col {
        height: 100%;
        box-sizing: border-box;
        margin: 24px 0;

        .category-item {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: flex-start;

            .title {
              font-size: 14px;
              padding-top: 10px;
              line-height: 40px;
              color: #FF7900;
            }

            .products:after {
                content: "";
                width: 100%;
                height: 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                position: relative;
                bottom: -10px;
                margin-top: 24px;
            }

            .products {
              float: none;
              // width: 537px;
              display: flex;
              flex-wrap: wrap;
              align-content: space-between;
              padding: 10px 0;
              color: #E1E3EB;
              /* General/text-md/CN-Medium */
              font-family: PingFang SC;
              font-size: 14px;
              font-style: normal;
              font-weight: 500;
              line-height: 22px;

              .item:hover {
                // color: #FF7900;
                border-radius: 8px;
                background: rgba(68, 71, 86, 0.8);

                .el-icon-right {
                  display: flex;
                }
              }

              .item {
                padding: 0 8px;
                overflow: hidden;
                position: relative;
                color: #E1E3EB;
                margin: 10px 5px;
                width: 180px;
                height: 48px;
                line-height: 40px;
                box-sizing: border-box;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;

                .el-icon-right {
                  display: none;
                }

                .info {
                    display: block;
                    float: left;
                    white-space: nowrap;

                    i {
                        display: inline-block;
                        float: none;
                        width: 16px;
                        vertical-align: middle;
                    }

                    .product-name {
                      width: 120px;
                      vertical-align: middle;
                      display: inline-block;
                      float: none;
                      // margin-left: 8px;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                      overflow: hidden;
                    }
                }

                .oper {
                    position: relative;
                    right: 4px;
                    margin-right: 0;
                    height: 100%;
                }
              }
            }
        }
    }
  }
}
</style>
