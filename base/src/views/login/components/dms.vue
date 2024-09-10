<template>
  <div id="dms">
    <div class="logo">
      <img :src="require('@/assets/images/Union.png')" alt="">
    </div>
    <div class="lang-select">
      <lang-select class="right-menu-item hover-effect" />
    </div>
    <div class="login-content">
      <div class="title">
        Welcome to LiangDao 
      </div>
      <div class="sys_name">
        在线数据闭环解决方案
      </div>

      <div class="loginFrom">
        <iframe
          id="loginFrom"
          :src="$keycloak.login" frameborder="0"></iframe>
          <!-- <el-button class="forgot" type="text" @click="openChangePasswordPage" style="font-size:12px;float:right">{{ $t('login.forgot') }}</el-button> -->
      </div>
    </div>

    <div class="login-bak-img">
      <img :src="require('@/assets/images/image 3.png')" alt="">
    </div>
  </div>
</template>

<script>
import Cookies from 'js-cookie'
import md5 from 'js-md5';
import LangSelect from '@/components/LangSelect'
import keycloakInfo from '@/utils/setKeycloak'
export default {
  components: {
    LangSelect
  },
  data(){
    var validateUser = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('home.Please_enter_your_name')));
      } else {
        if (this.ruleForm.password !== '') {
          this.$refs.ruleForm.validateField('ruleForm');
        }
        callback();
      }
    };
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$t('home.Please_enter_password')));
      }  else {
        callback();
      }
    };
    return{
      origin:null,
      client:null,
      keycloakIP:null,
      loading:false,
      NODE_ENV:null,
      ruleForm: {
        account: '',
        password: '',
        system:null,
        systemId:null
      },
      options:[],
      rules: {
        account: [
          { validator: validateUser, trigger: 'blur' }
        ],
        password: [
          { validator: validatePass, trigger: 'blur' }
        ]
      },
      logoImge:require('../../../assets/images/logo.png'),
    }
  },
  created(){
    this.NODE_ENV = process.env.NODE_ENV
    this.origin = window.location.origin
    this.client = location.host.split('.')[0]
    let First_point= location.host.substring(location.host.indexOf('.')+1)
    this.keycloakIP = First_point.substring(First_point.indexOf('.')+1)
  },
  mounted() {
    this.$nextTick(()=>{
      console.log("wodelu:dmsVue mounted!")
      let self = this
      if(this.NODE_ENV !== "development"){
        let iframeBox=document.getElementById("loginFrom");
        iframeBox.onload= async ()=>{
          let _obj=iframeBox.contentWindow || iframeBox.contentDocument;
          if(_obj.location.href){
            self.loading = true
            let systemId = keycloakInfo.client_id
            console.log("wodelu:调用ssrlogin")
            await this.$store.dispatch('operation/ssrlogin', {
              code:_obj.location.href.split('code=')[1],
              redirect_uri:_obj.location.href.split('?')[0],
              systemId:systemId
            }).then(res=>{
              self.loading =false
              console.log("wodelu:跳转")
              this.$router.push({path:'/'})
            })
          }
        }
      }else{
        this.ruleForm.system = keycloakInfo.client_name
        this.ruleForm.systemId = keycloakInfo.client_id
      }
    })
  },
  methods: {
    openChangePasswordPage(){
      let routeUrl = this.$router.resolve({
        path: '/forget/emil'
      })
      window.open(routeUrl.href, '_blank')
    },
  }
}
</script>

<style lang="scss">
#dms{
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  .logo{
    position: absolute;
    top: 24px;
    left: 24px;
    img{
      width: 123px;
      height: auto;
    }
  }

  .lang-select {
    position: absolute;
    top: 24px;
    right: 24px;
  }

  .login-bak-img{
    height: 100%;
    position: absolute;
    top:72px;
    right: 24px;
    img{
      width: auto;
      height: calc(100% - 96px);
    }
  }

  .login-content{
    width: 480px;
    height: 410px;
    position: absolute;
    top: 50%;
    margin-top: -205px;
    left: 15.625%;
    .loginFrom{
      position: relative;
      .forgot{
        position: absolute;
        right: 80px;
        bottom: 120px;
        color: #FF7900;
        font-family: 'Noto Sans SC';
        font-style: normal;
        font-weight: 400;
      }
    }

    #loginFrom{
      width: 480px;
      height: 350px;
      padding-top: 40px;
    }
    .title{
      text-emphasis-style: Title/text-5xl/I-EL-Medium;
      font-family: Poppins;
      font-style: SemiBold;
      font-size: 40px;
      line-height: 48px;
      color: #2D2F39;
    }
    .sys_name{
      text-emphasis-style: General/text-md/CN-Regular;
      font-family: Noto Sans SC;
      font-style: Regular;
      font-size: 14px;
      line-height: 22px;
      color: #5A5E72;
    }
    .forgot{
      position: relative;
    }
  }
}
</style>
