<template>
  <div id="common" :loading="loading">
    <div class="login-container">
      <div class="logo-title-container">
        <div class="grid-content bg-purple logo-title-rows">
          <img class="logo-image" :src="logoImge" alt="" draggable="false">
          <span class="logo-title-rows-span">
            <b>{{$keycloak.client_name !== 'daily-report'?$t('login.title'):'日报管理系统'}}</b>
          </span>
          <!-- <lang-select class="set-language language-box" /> -->
        </div>
      </div>
      <div class="login-from-container">
        <iframe v-if="NODE_ENV !== 'development'" id="loginFrom" :src="$keycloak.login" frameborder="0"></iframe>
          
        <el-form v-else :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
          <el-form-item :label="$t('login.username')" prop="account">
            <el-input type="text" v-model.trim="ruleForm.account" tabindex="1" autocomplete="on" size="small"></el-input>
          </el-form-item>
          <el-form-item  :label="$t('login.password')" prop="password">
            <el-input type="password" v-model.trim="ruleForm.password" autocomplete="off" show-password size="small"></el-input>
          </el-form-item>
          <el-form-item :label="$t('login.system')" prop="system">
            <el-select v-model="ruleForm.system" aria-setsize="mini" @change="getSystemInfo()">
              <el-option
                v-for="item in options"
                :key="item.client_id"
                :label="lang == 'zh'?item.client_cn_name:item.client_name"
                :value="item.client_name">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button size="small" type="" @click="submitForm('ruleForm')" >{{ $t('login.logIn') }}</el-button>
            <el-button type="text" @click="openChangePasswordPage" style="font-size:12px;float:right">{{ $t('login.forgot') }}</el-button>
          </el-form-item>
        </el-form>

        <el-button class="changePasswordPage" v-if="NODE_ENV !== 'development'" type="text" @click="openChangePasswordPage" style="font-size:12px;float:right">{{ $t('login.forgot') }}</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import Cookies from 'js-cookie'
// import LangSelect from '@/components/LangSelect'
import md5 from 'js-md5';
import keycloakInfo from '@/utils/setKeycloak'

export default {
  name: 'common',
  // components: { LangSelect },
  data() {
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
    return {
      origin:null,
      client:null,
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
    this.keycloakIP = location.host.substring(location.host.indexOf('.',1))
  },
  mounted() {
    this.$nextTick(()=>{
      let self = this
      if(this.NODE_ENV !== "development"){
        let iframeBox=document.getElementById("loginFrom");
        iframeBox.onload= async ()=>{
          let _obj=iframeBox.contentWindow || iframeBox.contentDocument;
          if(_obj.location.href){
            self.loading = true
            
            let systemId = keycloakInfo.client_id
            await this.$store.dispatch('operation/ssrlogin', {
              code:_obj.location.href.split('code=')[1],
              redirect_uri:_obj.location.href.split('?')[0],
              systemId:systemId
            }).then(res=>{
              self.loading =false
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
  computed: {
    lang() {
      return this.$store.getters.language
    }
  },
  methods: {
    getSystemInfo(){
      // @wodelu:TODO
      for(let i=0;i<this.options.length;i++){
        if(this.options[i].client_name == this.ruleForm.system){
          this.ruleForm.systemId = this.options[i].client_id
        }
      }
    },
    openChangePasswordPage(){
      const h = this.$createElement;
      this.$msgbox({
        title: '联系商务',
        message: h('p', null, [
          h('span', { style: 'color: #5A5E72;fontSize: 14px' }, '请联系亮道商务！')
        ]),
        showCancelButton: false,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            done();
          } else {
            done();
          }
        }
      })
      // let routeUrl = this.$router.resolve({
      //   path: '/forget/emil'
      // })
      // window.open(routeUrl.href, '_blank')
    },
    async submitForm(formName) {
      let ruleForm = {
        account:this.ruleForm.account,
        // password:md5(this.ruleForm.password),
        password: this.ruleForm.password,
        department:this.ruleForm.system,
        systemId:this.ruleForm.systemId
      }
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('operation/login', ruleForm)
            .then(async () => {
              this.$router.push({ path: '/' })
              this.loading = false
            })
            .catch((err) => {
              this.loading = false
              if(err.error_message == 'not allowed to enter the system'){
                this.$message({
                  message:'该系统未注册此账号，请切换系统尝试',
                  type: 'warning'
                });
              }else if(err.error_message == 'account error or password error'){
                this.$message({
                  message:'账户名或密码错误',
                  type: 'warning'
                });
              }else{
                this.$message({
                  message:'登录失败',
                  type: 'warning'
                });
              }
            })
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    getIframUrl(){
      var url = parent.document.getElementById("loginFrom").contentWindow.location.href;
      return url;
    }
  }
}
</script>

<style lang="scss">
.el-message-box{
  width: 480px;
  // height: 192px;
  font-size: 14px;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.04), 0px 4px 8px rgba(0, 0, 0, 0.08);
  border-radius: 12px!important;
  .el-message-box__title{
    font-family: 'Noto Sans SC';
    font-style: normal;
    font-weight: 600;
    font-size: 18px;
    line-height: 28px;
    color: #313235;
  }
  .el-message-box__btns{
    padding-top: 16px;
    .el-button--primary{
      background-color: #FF7900!important;
      border-color: #FF7900!important;
      color: #ffffff!important;
    }
    .el-button{
      background: #F3F4F7;
      color: #2D2F39;
    }
    .el-button:hover{
      color: #2D2F39;
      border-color: #DCDFE6;
    }
    .el-button--primary:hover{
      color: #ffffff;
    }
  }
}
#common{
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  background: rgba($color: rgb(2, 0, 15), $alpha: .8);
  .login-container{
    width: 440px;
    height: 370px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.3);
    position: absolute;
    left: 50%;
    top: 45%;
    margin-left: -220px;
    margin-top: -200px;
    .logo-title-container{
      padding: 10px;
      border-bottom: 1px solid rgba(0,0,0,.4);
      position: relative;
      .logo-title-rows{
        padding-left: 15px;
        display: flex;
        align-items: center;
        .logo-title-rows-span{
          flex: 1;
          margin-left: 15px;
          color: #f47a20;
        }
      }
      .logo-image{
        width: 115px;
      }
      .language-box{
        position: absolute;
        right: 10px;
        top: 20px;
      }
    }
    .login-from-container{
      width: 100%;
      padding: 30px 20px;
      display: flex;
      position: relative;
      #loginFrom{
        width: 100%;
        height: 250px;
        overflow: hidden;
      }
      .el-form{
        width: 80%;
      }

      .changePasswordPage{
        position: absolute;
        bottom: 30px;
        right: 30px;
      }
    }
  }
  
}
</style>
