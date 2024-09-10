<template>
  <div id="forget">
    <div class="forget-header">
      <div class="forget-header-content">
        <img class="logo-image" :src="logoImge" alt="" draggable="false">
        <span style="margin:0px 15px">|</span>
        <b>
          {{currentRole == 'SubmitEmil'?($store.getters.language === 'zh'?'忘记密码':'Forgot password'):($store.getters.language === 'zh'?'重置密码':'Reset Password')}}
        </b>
      </div>
    </div>
    <component :is="currentRole" />
  </div>
</template>

<script>
import SubmitEmil from './components/SubmitEmil'
import SubmitPassword from './components/SubmitPassword'
export default {
  name: 'Dashboard',
  components: { SubmitEmil , SubmitPassword },
  data() {
    return {
      currentRole: 'SubmitEmil',
      logoImge:require('@/assets/images/logo.png'),
    }
  },
  created() {
    if(this.$route.query.token){
      this.currentRole = 'SubmitPassword'
    }
  }
}
</script>

<style lang="scss" >
#forget{
  width: 100%;
  height: 100vh;
  .forget-header{
    width: 100%;
    height: 70px;
    // background: #eb5e24;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #eb5e24;
    border-bottom: 1px solid #cccccc;
    .forget-header-content{
      width: 50%;
      display: flex;
      align-items: center;
      .logo-image{
        height: 35px;
      }
    }
  }
}
</style>
