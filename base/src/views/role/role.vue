<template>
  <div id="role">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>用户组</span>
      </div>
      <div>
        <div style="padding-bottom:10px">
          <el-button size="mini" type="danger" @click="deleteRoles" plain>删 除</el-button>
          <el-button size="mini" type="success" @click="addNewRole">新 增</el-button>
        </div>
        <!--  :height="tableHeight" -->
        <el-table
          :data="tableData"

          border
          :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
          @selection-change="handleSelectionChange"
          style="width: 100%;padding-bottom:10px">
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            prop="id"
            label="组ID"
            width="100">
          </el-table-column>
          <!-- todo 公司名的值 -->
          <el-table-column
            prop="name"
            label="名称"
            width="180">
            <template slot-scope="scope">
              <el-link @click="openroleInfo(scope.row.id)" type="primary">{{ scope.row.name }}</el-link>
            </template>
          </el-table-column>
          <el-table-column
            label="创建时间"
            width="180">
            <template slot-scope="scope">
              {{ formatter(scope.row.create_time,"yyyy-MM-dd hh:mm:ss") }}
            </template>
          </el-table-column>
          <el-table-column
            label="创建人"
            width="180">
            <template slot-scope="scope">
              {{ scope.row.creater.account }}
            </template>
          </el-table-column>
          <el-table-column
            label="更新时间">
            <template slot-scope="scope">
              {{ formatter(scope.row.update_time,"yyyy-MM-dd hh:mm:ss") }}
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[100]"
          :page-size="formInline.limit"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
    <addNewRoleVue :addRoleProps="addRoleProps" @updateNewList="updateNewList" v-if="addRoleProps.dialogVisible"/>
  </div>
</template>

<script>
import addNewRoleVue from './addNewRole.vue'
import { getRoleGroupe , deleteRoleGroupes } from '@/api/user'
export default {
  components:{
    addNewRoleVue
  },
  data() {
    return {
      tableData: [],
      tableHeight:44.1 * 16,
      currentPage:1,
      formInline:{
        limit: 100,
        offset: 0
      },
      total:0,
      addRoleProps:{
        dialogVisible:false
      },
      multipleSelection: []
    }
  },
  created(){
    this.getRoleList()
  },
  methods:{
    getRoleList(){
      getRoleGroupe(this.formInline).then(res=>{
        this.tableData = res.data
        this.total = res.total
      }).catch(err=>{
        console.log(err)
      })
    },
    handleSizeChange(val) {
      this.formInline.limit = val
      this.tableHeight = 45 * (val+1)
      this.getRoleList()
    },
    handleCurrentChange(val) {
      this.formInline.offset = (val - 1) * this.formInline.limit
      this.getRoleList()
    },
    addNewRole(){
      this.addRoleProps.dialogVisible = true
    },
    updateNewList(){
      this.getRoleList()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
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
    deleteRoles(){
      if(this.multipleSelection.length > 0){
        this.$confirm(
          `<span>执行删除前请确认所有需要删除的用户组，防止误删带来的不便：</span>
          <br/>
          <span>
            <b style="color:#e6a23c">${
              this.multipleSelection.map((item,index) =>{
                return `${(index+1)}. ${item.name}`
              }).join(' 、 ')
            }</b>
          </span>
          ` ,
          '确认信息', {
          dangerouslyUseHTMLString:true,
          distinguishCancelAndClose: true,
          confirmButtonText: '删除',
          cancelButtonText: '放弃删除'
        }).then(() => {
          this.multipleSelection.forEach((item,index) => {
            deleteRoleGroupes(item.id).then(res=>{
              console.log(res)
            })
          });
          this.getRoleList()
        })
        .catch(action => {
          // this.multipleSelection = []
        });
      }else{
        this.$confirm('未选择需要删除的用户组?', '提示', {
          confirmButtonText: '确定',
          type: 'warning',
          showCancelButton:false
        })
      }
      console.log(this.multipleSelection,'this.multipleSelection')
    },
    openroleInfo(arg){
      this.$router.push({name:'roleInfo',params:{id:arg}})
    }
  }
}
</script>

<style lang="scss">
#role{
  width: 100%;
  max-height: calc(100vh - 84px);
  overflow: auto;
  padding: 10px;
}
</style>
