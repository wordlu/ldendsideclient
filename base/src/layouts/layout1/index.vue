<template>
  <div id="Layout1">
    <div id="topBar">
      <div class="login-nav-left">
        <img
          class="login"
          :src="require('@/assets/images/Union.png')"
          alt=""
        />
      </div>
      <div class="login-nav-right">
        <!-- <span style="font-size: 14px;font-weight: bold;">端侧基线产品</span> -->
        <!-- <div
          class="userSet"
          @click="clickAccount"
        >
          <img
            class="userImg"
            :src="require('@/assets/images/Ellipse 1.png')"
            alt=""
          />
          <span class="account">
            {{ account }}
          </span>
          <svg-icon
            icon-class="down"
            class="down"
            style="width: 16px; height: 16px; margin-left: 8px"
          />
          <div
            class="dropdown"
            v-if="showDropdown"
          >
            <div
              class="dropdown-item"
              @click="logout"
            >
              {{ $t('common["退出登录"]') }}
            </div>
          </div>
        </div>
        <lang-select
          class="right-menu-item hover-effect"
          style="margin-left: 10px; margin-top: 9px"
        /> -->
      </div>
    </div>
    <div id="main">
      <navMenu :activeRouter="activeRouter"></navMenu>
      <div :id="navMenutype == 'navMenu' ? 'containerMenu' : 'container'">
        <section id="Appmicro"></section>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import LangSelect from "@/components/LangSelect";
import { mapGetters } from "vuex";
import Cookies from "js-cookie";
import Breadcrumb from "@/components/Breadcrumb";
import Dropdown from "@/components/Dropdown/Dropdown.vue";
import navMenu from "./menu/navMenu.vue";
import { debounce } from "@/utils";
import actions from "@/micros/actions";
export default {
  components: {
    Breadcrumb,
    Dropdown,
    navMenu,
    LangSelect,
  },
  computed: {
    ...mapGetters(["menuList"]),
  },
  data () {
    return {
      account: "",
      activeRouter: null,
      showDropdown: false,
      showLangsDropdown: false,
      navMenutype: "Dropdown",
      drawer: false,
      direction: "ltr",
      showNavMenu: true,
      pathnameArr: ["dmsshell"],
      window: window,
      ingress: ""
    };
  },
  watch: {
    $route (to, from) {
      if (to.meta.cat == "menu") {
        this.navMenutype = "navMenu";
      } else {
        this.navMenutype = "Dropdown";
      }
      this.activeRouter = to.path;
    },
  },
  created () {
    if (this.$route.meta.cat == "menu") {
      this.navMenutype = "navMenu";
    } else {
      this.navMenutype = "Dropdown";
    }
    this.activeRouter = this.$route.path;
    this.account = Cookies.get("account")
  },
  methods: {
    clickAccount () {
      this.showDropdown = !this.showDropdown;
    },
    logout () {
      location.href = this.$keycloak.logout;
      this.$store.dispatch('operation/logout');
    },
  },
};
</script>

<style lang="scss">
#Layout1 {
  width: 100%;
  height: 100%;
  .breadcrumb {
    height: 50px;
  }
  .breadcrumb-container {
    margin-left: 24px;
  }
  #topBar {
    width: 100%;
    height: 80px;
    padding: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;

    .login-nav-right {
      display: flex;
    }

    .login-nav-left {
      display: flex;
      align-items: center;
    }
    .menus {
      // width: 363px; //484px
      height: 32px;
      display: flex;
      justify-content: space-between;
      background: #f3f4f7;
      border-radius: 20px;

      .menu-item {
        // width: 120px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 10px;
      }

      .menu-item.active {
        // background: #fff;
        // border: 2px solid #F3F4F7;
        border-radius: 20px;
        color: #04a3ff;
        background: rgba(4, 163, 255, 0.12);
      }
    }
    .login {
      width: 123px;
      height: 32px;
    }
    .Dropdown {
      z-index: 1;
      position: absolute;
      left: 163px;
      top: 28px;
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    .menu-drawer {
      top: 80px;
    }
    .userSet {
      position: relative;
      cursor: pointer;
      .userImg {
        width: 32px;
        height: 32px;
      }
      display: flex;
      align-items: center;
      .account {
        margin-left: 8px;
        /* General/text-md/I-EL-Medium */

        font-family: "Poppins";
        font-style: normal;
        font-weight: 600;
        font-size: 14px;
        line-height: 22px;
        /* identical to box height, or 157% */

        text-align: center;

        /* 01 Netural/N700 */

        color: #2d2f39;
      }

      .dropdown {
        z-index: 1;
        position: absolute;
        right: 0;
        top: 38px;
        width: 100px;
        background: #ffffff;
        border-radius: 8px;
        border: 0.5px solid #f3f4f7;
        /* Light/Depth-Z300 */

        box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.04),
          0px 8px 16px rgba(0, 0, 0, 0.08);

        /* General/text-md/CN-Regular */

        font-family: "PingFang SC";
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        /* identical to box height, or 157% */

        /* 01 Netural/N700 */
        color: #2d2f39;

        .dropdown-item {
          padding: 8px 0;
          text-align: center;
        }
        .dropdown-item:hover {
          background: #f9f9fb;
        }
      }
    }
  }
  #main {
    display: flex;
    width: 100%;
    height: calc(100% - 130px);
    overflow: hidden;
    #container {
      width: 100vw;
      #Appmicro,
      #__qiankun_microapp_wrapper_for_project__,
      #__qiankun_microapp_wrapper_for_scene_library__ {
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
    }
    #containerMenu {
      // width: calc(100vw - 200px);
      width: 100%;
      #Appmicro,
      #__qiankun_microapp_wrapper_for_project__,
      #__qiankun_microapp_wrapper_for_scene_library__ {
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
    }
  }
}
</style>