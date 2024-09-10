<template>
  <div id="Layout2">
    <div id="topBar">
      <img class="login" :src="require('@/assets/images/Union.png')" alt="">
      <Dropdown v-if="activeRouter !== '/landing/landing' && navMenutype == 'Dropdown'"/>
      <div class="userSet" @click="clickAccount">
        <img class="userImg" :src="require('@/assets/images/Ellipse 1.png')" alt="">
        <span class="account">
          {{ account }}
        </span>
        <svg-icon icon-class="down" class="down" style="width:16px;height:16px;margin-left:8px;"/>
        <div class="dropdown" v-if="showDropdown">
          <div class="dropdown-item" @click="logout">
            退出登录
          </div>
        </div>
      </div>
    </div>
    <div class="breadcrumb">
      <Breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-show="activeRouter !== '/landing/landing'"/>
    </div>
    <div id="main">
      <navMenu :activeRouter="activeRouter" v-if="navMenutype == 'navMenu'"></navMenu>
      <div :id="navMenutype == 'navMenu'?'containerMenu':'container'">
        <section id="Appmicro"></section>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import Cookies from 'js-cookie'
import Breadcrumb from '@/components/Breadcrumb'
import Dropdown from '@/components/Dropdown/Dropdown.vue'
import navMenu from './navMenu/navMenu.vue'
export default {
  components:{
    Breadcrumb , Dropdown , navMenu
  },
  data(){
    return{
      account:'',
      activeRouter:null,
      showDropdown:false,
      navMenutype:'Dropdown'
    }
  },
  watch:{
    $route(to,from){
      if(to.meta.cat == 'menu'){
        this.navMenutype = 'navMenu'
      }else{
        this.navMenutype = 'Dropdown'
      }
      this.activeRouter = to.path
    }
  },
  created(){
    if(this.$route.meta.cat == 'menu'){
      this.navMenutype = 'navMenu'
    }else{
      this.navMenutype = 'Dropdown'
    }
    this.activeRouter = this.$route.path;
    this.account = Cookies.get('account');
  },
  methods:{
    clickAccount(){
      if(this.showDropdown){
        this.showDropdown = false
      }else{
        this.showDropdown = true
      }
    },
    logout(){
      location.href = this.$keycloak.logout;
      this.$store.dispatch('operation/logout')
    }
  }
}
</script>

<style lang="scss">
#Layout2{
  width: 100%;
  height: 100%;
  .breadcrumb{
    height: 50px;
  }
  .breadcrumb-container{
    margin-left: 24px;
  }
  #topBar{
    width: 100%;
    height: 80px;
    padding: 24px;
    display: flex;
    justify-content: space-between;
    position: relative;
    .login{
      width: 123px;
      height: 32px;
    }
    .Dropdown{
      z-index: 1;
      position: absolute;
      left: 163px;
      top: 28px;
      display: flex;
      align-items: center;
      cursor:pointer;
    }
    .userSet{
      position: relative;
      cursor: pointer;
      .userImg{
        width: 32px;
        height: 32px;
      }
      display: flex;
      align-items: center;
      .account{
        margin-left: 8px;
        /* General/text-md/I-EL-Medium */

        font-family: 'Poppins';
        font-style: normal;
        font-weight: 600;
        font-size: 14px;
        line-height: 22px;
        /* identical to box height, or 157% */

        text-align: center;

        /* 01 Netural/N700 */

        color: #2D2F39;
      }

      .dropdown{
        position: absolute;
        right: 0;
        top: 38px;
        width: 100px;
        background: #ffffff;
        border-radius: 8px;
        border: 0.5px solid #F3F4F7;
        /* Light/Depth-Z300 */

        box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.04), 0px 8px 16px rgba(0, 0, 0, 0.08);

        /* General/text-md/CN-Regular */

        font-family: 'PingFang SC';
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        /* identical to box height, or 157% */

        /* 01 Netural/N700 */
        color: #2D2F39;

        .dropdown-item{
          padding: 8px 0;
          text-align: center;
        }
        .dropdown-item:hover{
          background: #F9F9FB;
        }
      }
    }
  }
  #main{
    display: flex;
    width: 100%;
    height: calc(100% - 130px);
    overflow: hidden;
    #container{
      width: 100vw;
      #Appmicro,#__qiankun_microapp_wrapper_for_project__,#__qiankun_microapp_wrapper_for_scene_library__{
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
    }
    #containerMenu{
      width: calc(100vw - 200px);
      #Appmicro,#__qiankun_microapp_wrapper_for_project__,#__qiankun_microapp_wrapper_for_scene_library__{
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
    }
  }
}

</style>