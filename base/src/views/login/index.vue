<template>
  <div id="Login">
    <!-- 本地调试及日报系统使用老版本登录页面 -->
    <commonVue v-if="$keycloak.client_name === 'dailyReport' || window.location.hostname === 'localhost'"/>
    <dmsVue v-else/>
  </div>
</template>

<script>
import commonVue from './components/common.vue'
import dmsVue from './components/dms.vue'
export default {
  components:{
    commonVue , dmsVue
  },
  name: 'Login',
  data() {
    return {
      window: window
    }
  },
  created(){
    console.log(process.env,'process')
    console.log(process.env.NODE_ENV,'process.ENV')
  },
  mounted() {

  },
  computed: {

  },
  methods: {

  }
}
</script>

<style lang="scss">
#Login{
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
</style>
