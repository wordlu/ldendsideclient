<template>
  <div class="dashboard-container">
    <component :is="currentRole" />
  </div>
</template>

<script>
import adminDashboard from './admin'
import editorDashboard from './editor'
// import api from '@/jsonapi/api'
// let apiModules = new api()

export default {
  name: 'Dashboard',
  components: { adminDashboard, editorDashboard },
  data() {
    return {
      currentRole: 'adminDashboard'
    }
  },
  created() {
    this.currentRole = 'adminDashboard'
    // if(sessionStorage.getItem('toPath')){
    //   this.$router.push(JSON.parse(sessionStorage.getItem('toPath')))
    //   sessionStorage.removeItem('toPath')
    // }
  },
  methods:{
    
  }
}
</script>
