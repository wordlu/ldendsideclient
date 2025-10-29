<template>
  <div id="dailyReport"></div>
</template>

<script>
import { func_reviewers } from '@/api/user'
import jsCookie from 'js-cookie'
export default {
  data(){
    return{

    }
  },
  created(){
    this.filterRole()
  },
  methods:{
    filterRole(){
      func_reviewers().then(res=>{
        const account = jsCookie.get('account')
        if(this.isRdvp(res.data.rdvp,account)){
          this.$router.push('/dailyReport/dailyStatistics')
        }else if(this.isDepartment_manager(res.data.roles.department_manager,account)){
          this.$router.push('/dailyReport/dailyStatistics')
        }else if(this.isproject_manager(res.data.roles.project_manager,account)){
          this.$router.push('/dailyReport/dailyReview')
        }else if(this.ispre_sale_manager(res.data.roles.pre_sale_manager,account)){
          this.$router.push('/projectPersonnelManage/secprojectList')
        }else{
          this.$router.push('/dailyReport/dailyList')
        }
      }).catch((err)=>{
        this.$router.push('/dailyReport/dailyList')
      })
    },
    isRdvp(rdvps,account){
      let arr = rdvps.filter((item)=>{
        return item == account
      })
      if(arr.length > 0){
        return true
      }else{
        return false
      }
    },
    isDepartment_manager(list,account){
      let arr = list.filter((item)=>{
        return item == account
      })
      if(arr.length > 0){
        return true
      }else{
        return false
      }
    },
    isproject_manager(list,account){
      let arr = list.filter((item)=>{
        return item == account
      })
      if(arr.length > 0){
        return true
      }else{
        return false
      }
    },
    ispre_sale_manager(list,account){
      let arr = list.filter((item)=>{
        return item == account
      })
      if(arr.length > 0){
        return true
      }else{
        return false
      }
    },
  }
}
</script>

<style>

</style>