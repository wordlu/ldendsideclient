<template>
  <div id="roleInfo">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>用户组详情</span>
      </div>
      <div style="width:300px">
        <el-descriptions class="margin-top" :column="1" size="mini" border>
          <el-descriptions-item>
            <template slot="label">
              名称
            </template>
            <span v-if="isEditor">
              <el-input size="mini" v-model.trim="ruleForm.name"></el-input>
            </span>
            <span v-else>
              {{infoTable.name}}
            </span>
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              创建时间
            </template>
            {{formatter(infoTable.create_time,"yyyy-MM-dd hh:mm:ss")}}
          </el-descriptions-item>
          <el-descriptions-item>
            <template slot="label">
              创建人
            </template>
            <span v-if="infoTable.account">{{infoTable.account}}</span>
          </el-descriptions-item>
        </el-descriptions>
        <div style="margin-top:10px">
          <el-button type="danger" @click="deleteRole" size="mini" plain>删 除</el-button>
          <el-button type="primary" size="mini" @click="editorInfo" v-if="!isEditor">编 辑</el-button>
          <el-button type="primary" size="mini" @click="saveInfo" v-else>保 存</el-button>
        </div>
      </div>
    </el-card>

    <div class="footer-role">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>权限</span>
        </div>
        <div>
          <el-tree
            :data="functionsList"
            show-checkbox
            node-key="id"
            ref="tree"
            highlight-current
            @check="getNodeRow"
            :default-checked-keys="rolesId"
            style="padding:0 0 20px 0"
            :props="defaultProps">
          </el-tree>
        </div>
      </el-card>

      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>用户</span>
        </div>
        <div>
          <div style="padding:10px 0">
            <el-button size="mini" @click="deleteUser" type="danger">删除</el-button>
            <el-button size="mini" @click="inscreaseUser" type="primary">新增</el-button>
          </div>
          <!-- :data="users" -->
          <el-table
            ref="multipleTable"
            :data="tableData.slice((currentPage-1)*100,currentPage*100)"
            tooltip-effect="dark"
            :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
            style="width: 100%;padding:0 0 20px 0"
            @selection-change="handleSelectionChange">
            <el-table-column
              type="selection"
              width="55">
            </el-table-column>
            <el-table-column
            :label="'公司'"
              width="120">
              <template slot-scope="scope">{{ scope.row.company_short_name }}</template>
            </el-table-column>
            <el-table-column
            :label="$t('name')"
              width="120">
              <template slot-scope="scope">{{ scope.row.name }}</template>
            </el-table-column>
            <el-table-column
              prop="account"
              :label="$t('LoginID')"
              width="120">
            </el-table-column>
            <el-table-column
              prop="email"
              :label="$t('email')"
              show-overflow-tooltip>
            </el-table-column>
          </el-table>
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </div>
      </el-card>
    </div>
    <increaseNewUser :increaseNewUserProps="increaseNewUserProps" @getNewUserlist="getNewUserlist" v-if="increaseNewUserProps.dialogVisible" />
  </div>
</template>

<script>
import increaseNewUser from './increaseNewUser.vue'
import { getRoleItem,getRoleItemPage , deleteRoleGroupes , putRoleGroupes , getAllfunctions , putRolebondfunction , putRoleunbondfunction , putunbond_user } from '@/api/user'
import store from '@/store'
import { watch } from 'fs'
import Cookies from 'js-cookie'
export default {
  components:{
    increaseNewUser
  },
  data(){
    return{
      infoTable:{},
      rolesId:[],
      functions:[],
      functionsList:[],
      def_functionsList:[],
      defaultProps: {
        children: 'children',
        label: this.$i18n.locale == 'zh'?'cn_name':'name'
      },
      users:[],
      isEditor:false,
      ruleForm: {
        name: ''
      },
      tableData:[],
      tableDataBack:[],
      multipleSelection:[],
      options:[],
      currentPage:1,
      treeStatus:false,
      increaseNewUserProps:{
        dialogVisible:false,
        group:this.$route.params.id
      },
      multipleSelection:[],
      role_id:null
    }
  },
  created(){

  },
  mounted(){
    this.getRoleItemInfo()
  },
  methods:{
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
      this.currentPage = val
      this.$forceUpdate()
    },
    deleteRole(){
      this.$confirm('确认删除此用户组?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteRoleGroupes(this.role_id).then(res=>{
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.closeSelectedTag()
            this.$router.go(-1)
          }).catch((err)=>{

          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
    },
    closeSelectedTag(view) {
      this.$store.dispatch('tagsView/delView', this.$route).then(({ visitedViews }) => {})
    },
    getRoleItemInfo(){
      this.rolesId = []
      this.functions = []
      this.functionsList = []
      this.users = []

      getRoleItem(this.$route.params.id).then(res=>{
        this.functions = res.functions
        this.ruleForm.name = res.name
        this.role_id = res.id
        this.infoTable ={
          create_time:res.create_time,
          name:res.name,
          update_time:res.update_time,
          account:res.creater?res.creater.account:null,
          creater_id:res.creater_id
        }
        this.setFunctions(this.functions)
        // 增加分页
        // this.users = res.users
        this.tableData = res.users
        this.tableDataBack = res.users
        // this.total = res.users.length
        this.total = this.tableData.length
        this.currentPage = 1
        // 分页结束
      }).catch(err=>{
        console.log(err)
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    getrolesId(functions,role){
      let self = this
      let array = []
      for(let i=0;i<functions.length;i++){
        this.$nextTick(()=>{
          if(functions[i].url.indexOf('webPage') !== -1){
            var node = this.$refs.tree.getNode(functions[i].id)
            if(functions[i].children ==0 || !functions[i].children) {
              for(let j=0;j<role.length;j++){
                if(role[j].id == functions[i].id){
                  this.$refs.tree.setChecked(node,true)
                }
              }
            }else{
              this.recursionId(functions[i].children,node,role)
            }
          }
        })
      }
      self.rolesId = array
    },
    deleteUser(){
      if(this.multipleSelection.length !== 0){
        this.multipleSelection.forEach((item)=>{
          console.log('执行了',item)
          putunbond_user({
            role_id:this.$route.params.id,
            user_id:item.id
          }).then(res=>{

          }).catch(err=>{
            console.log(err,'err')
          })
        })
        this.$notify({
          title:  this.$store.getters.language === 'zh'?'成功':'successfully',
          message: '用户移除成功',
          type: 'success'
        });
        setTimeout(()=>{
          this.getRoleItemInfo()
        },200)
      }else{
        this.$message({
          message: '您未选择删除的用户',
          type: 'warning'
        });
      }

    },
    recursionId(row,node,role){
      for(let i=0;i<row.length;i++){
        var node = this.$refs.tree.getNode(row[i].id)
        if(row[i].children ==0 || !row[i].children) {
          for(let j=0;j<role.length;j++){
            if(role[j].id == row[i].id){
              this.$refs.tree.setChecked(node,true)
            }
          }
        }else{
          this.recursionId(row,node)
        }
      }
    },
    async getNodeRow(data,checked){
      if(data.children){
        let ids = []
        data.children.forEach((item)=>{
          let is_power = false;
          for(let i=0;i<checked.checkedKeys.length;i++){
            if(checked.checkedKeys[i] == item.id){
              item.is_power = true
              is_power = true
            }
          }
          if(!is_power){
            item.is_power = false
          }
          ids.push({
            status:is_power,
            menu_id:item.id.split('_')[0],
            page_id:item.id.split('_')[1]
          })
        })

        this.setRole(ids)
      }else{
        let ids = []
        let is_power = false;
        for(let i=0;i<checked.checkedKeys.length;i++){
          if(checked.checkedKeys[i] == data.id){
            data.is_power = true
            is_power = true
          }
        }
        if(!is_power){
          data.is_power = false
        }
        ids.push({
          status:is_power,
          menu_id:data.id.split('_')[0],
          page_id:data.id.split('_')[1]
        })
        this.setRole(ids)
      }
    },
    setRole(ids){
      let option = {
        modify_role_id:this.$route.params.id
      };
      ids.forEach((item)=>{
        if(item.status){
          if(!option.is_power){
            option.is_power = []
          }
          option.is_power.push(
            {
              menu_id:item.menu_id,
              page_id:item.page_id
            }
          )
        }else{
          if(!option.no_power){
            option.no_power = []
          }
          option.no_power.push(
            {
              menu_id:item.menu_id,
              page_id:item.page_id
            }
          )
        }
      })
      this.$systemApi.setRolePages('/client/micro_frontend_conf_manage',option)
    },
    getNewUserlist(){
      setTimeout(()=>{
        this.getRoleItemInfo()
      },500)
    },
    inscreaseUser(){
      this.increaseNewUserProps.dialogVisible = true
    },
    setFunctions(){
      let menuList = []
      this.$systemApi.getRolePages('client',Cookies.get('roles'),this.$route.params.id,Cookies.get('systemId')).then(res=>{
        res.client.micro_app.forEach((item)=>{
          item.menu.forEach((menu_item,index)=>{
            let active_menu;
            if(this.$route.params.id == 1 && menu_item.menu_code == "permissionRoleManage"){
              active_menu = {
                id:menu_item.menu_id,
                name:menu_item.menu_name,
                cn_name:menu_item.menu_cn_name,
                children:[],
                disabled:true
              }

              menu_item.page.forEach((page_item)=>{
                active_menu.children.push({
                  id:menu_item.menu_id+'_'+page_item.page_id,
                  name:page_item.page_name,
                  cn_name:page_item.page_cn_name,
                  is_power:page_item.is_power,
                  disabled:true
                })
              })
            }else if(this.$route.params.id != 1 && menu_item.menu_code == "permissionRoleManage"){
              active_menu = {
                id:menu_item.menu_id,
                name:menu_item.menu_name,
                cn_name:menu_item.menu_cn_name,
                children:[],
                disabled:true
              }

              menu_item.page.forEach((page_item)=>{
                active_menu.children.push({
                  id:menu_item.menu_id+'_'+page_item.page_id,
                  name:page_item.page_name,
                  cn_name:page_item.page_cn_name,
                  is_power:false,
                  disabled:true
                })
              })
            }else{
              active_menu = {
                id:menu_item.menu_id,
                name:menu_item.menu_name,
                cn_name:menu_item.menu_cn_name,
                children:[],
              }

              menu_item.page.forEach((page_item)=>{
                active_menu.children.push({
                  id:menu_item.menu_id+'_'+page_item.page_id,
                  name:page_item.page_name,
                  cn_name:page_item.page_cn_name,
                  is_power:page_item.is_power
                })
              })
            }


            menuList.push(active_menu)
          })
        })
        this.def_functionsList = JSON.parse(JSON.stringify(menuList))
        this.functionsList = menuList;
        setTimeout(()=>{
          this.setChecked()
        },100)
      })
    },
    setChecked(){
      for(let i=0;i<this.functionsList.length;i++){
        for(let j=0;j<this.functionsList[i].children.length;j++){
          if(this.functionsList[i].children[j].is_power){
            let node = this.$refs.tree.getNode(this.functionsList[i].children[j].id)
            this.$refs.tree.setChecked(node,true)
          }
        }
      }
    },
    recursion(row){
      this.functionsList.forEach(item => {
        if(row.parent_id == item.id){
          item.children.push(row)
        }
      });
    },
    editorInfo(){
      this.isEditor = true
    },
    saveInfo(){
      if(this.ruleForm.name !== ''){
        if(this.ruleForm.name == this.infoTable.name){
          this.isEditor = false
        }else{
          putRoleGroupes({role_id:this.$route.params.id,name:this.ruleForm.name,creater_id:this.infoTable.creater_id}).then(res=>{
            this.isEditor = false
            this.getRoleItemInfo()
            this.$notify({
              title:  this.$store.getters.language === 'zh'?'成功':'successfully',
              message: `用户组 ${this.ruleForm.name} 保存成功`,
              type: 'success'
            });
          }).catch(err=>{
            console.log(err,'err')
          })
        }
      }else{
        this.$confirm('名称不可为空', '提示', {
          confirmButtonText: '确定',
          type: 'warning',
          showCancelButton:false
        }).then(() => {
          this.ruleForm.name = this.infoTable.name
        })
      }
    },
    formatter(thistime, fmt) {
      let $this = new Date(thistime)
      let o = {
        'M+': $this.getMonth() + 1,
        'd+': $this.getDate(),
        'h+': $this.getHours(),
        'm+': $this.getMinutes(),
        's+': $this.getSeconds(),
        'q+': Math.floor(($this.getMonth() + 3) / 3),
        'S': $this.getMilliseconds()
      }
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ($this.getFullYear() + '').substr(4 - RegExp.$1.length))
      }
      for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
        }
      }
      return fmt
    },
  }
}
</script>

<style lang="scss">
#roleInfo{
  width: 100%;
  max-height: calc(100vh - 84px);
  overflow: auto;
  padding: 10px;
  .footer-role{
    width: 100%;
    height: calc(100vh - 84px - 250px);
    margin-top: 10px;
    // padding: 15px;
    display: flex;
    justify-content: space-between;
    .el-card{
      width: 49.5%;
      height: calc(95% - 15px);
      .el-card__body{
        height: calc(95% - 15px);
        overflow: auto;
      }
    }
  }
}
</style>
