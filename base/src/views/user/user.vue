<template>
  <div id="user">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <!-- <span>用户列表</span> -->
        <span>{{$t('home.userList')}}</span>
          <div id="searchUser">
            <el-form id="searchUser2" ref="search_params" :model="formInline" label-width="140px">
            <el-row :gutter="0">

              <el-col :span="6" :offset="4">
                <el-form-item :label="'公司名'">
                  <el-select v-model="formInline.company_id" placeholder="" >
                    <el-option :label="'全部'" value="all"></el-option>
                    <el-option v-for="item in companyListData" :label="item.short_name" :value="item.id"></el-option>
                  </el-select>
                </el-form-item>

              </el-col>

              <el-col :span="6">
                <el-form-item :label="'姓名'">
                  <el-input size="mini" v-model="formInline.name"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6" :offset="1">
                <el-button type="primary" size="mini" @click="getusersList()">{{'查询'}}</el-button>
              </el-col>

            </el-row>
          </el-form>
          </div>

        <!-- <span style="padding-left:20px">{{$t('home.userList')}}</span> -->

        <!-- 公司名：
        姓名:
        搜索
        <el-button size="mini" @click="" type="primary">搜素</el-button> -->
      </div>

      <div>
        <div style="padding:10px">
          <el-button size="mini" type="danger" @click="deleteUsers">
          <!-- 删除 -->
          {{$t('delete')}}
          </el-button>
          <el-button size="mini" @click="updateUserinfoFunction" type="primary"> {{$t('edit')}}</el-button>
          <el-button size="mini" @click="addnewUserFunction" type="success"> {{$t('add')}}</el-button>
        </div>
        <!--  :height="tableHeight" -->
        <el-table
          :data="tableData"

          border
          :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
          @selection-change="handleSelectionChange"
          style="width: 100%;padding-bottom:10px">
          <el-table-column
          fixed="left"
            type="selection"
            width="55">
          </el-table-column>
          <!-- 公司 -->
          <el-table-column
            :label="'公司'"
            width="170">
            <template slot-scope="scope">
              {{scope.row.company_short_name	}}
              <!-- <el-link @click="openroleInfo(scope.row.id)" type="primary">{{ scope.row.name }}</el-link> -->
            </template>
          </el-table-column>
          <!-- 姓名 -->
          <el-table-column
            :label="$t('name')"
            width="150">
            <template slot-scope="scope">
              {{scope.row.name	}}
              <!-- <el-link @click="openroleInfo(scope.row.id)" type="primary">{{ scope.row.name }}</el-link> -->
            </template>
          </el-table-column>
          <!-- 登录ID -->
          <el-table-column
          :label="$t('LoginID')"
            width="110">
            <template slot-scope="scope">
              {{scope.row.account	}}
              <!-- <el-link @click="openroleInfo(scope.row.id)" type="primary">{{ scope.row.name }}</el-link> -->
            </template>
          </el-table-column>
          <!-- 邮箱 -->
          <el-table-column
          :label="$t('email')"
            width="200">
            <template slot-scope="scope">
              {{scope.row.email	}}
              <!-- <el-link @click="openroleInfo(scope.row.id)" type="primary">{{ scope.row.name }}</el-link> -->
            </template>
          </el-table-column>
          <!-- 电话 -->
          <el-table-column
          :label="$t('phone')"
            width="140">
            <template slot-scope="scope">
              {{scope.row.phone	}}
              <!-- <el-link @click="openroleInfo(scope.row.id)" type="primary">{{ scope.row.name }}</el-link> -->
            </template>
          </el-table-column>
          <!-- 创建时间 -->
          <el-table-column
          :label="$t('createTime')"
            width="140">
            <template slot-scope="scope">
              {{ formatter(scope.row.create_time,"yyyy-MM-dd hh:mm:ss") }}
            </template>
          </el-table-column>
          <!-- 注销日期 -->
          <el-table-column
          :label="$t('cancellationDate')"
            width="140">
            <template slot-scope="scope">
              {{ scope.row.expire_time !=='' ?formatter(scope.row.expire_time,"yyyy-MM-dd hh:mm:ss"):'' }}
            </template>
          </el-table-column>
          <el-table-column
          :label="$t('operation')"
            fixed="right"
            >
            <template slot-scope="scope">
              <el-button type="text" @click="updatePasswordFunction(scope.row)">
                <!-- 修改密码 -->
                {{$t('ChangeThePassword')}}
              </el-button>
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

    <addNewUser :addNewUserProps="addNewUserProps" @updateNewList="updateNewList" v-if="addNewUserProps.dialogVisible"/>
    <updatePassword :updatePasswordProps="updatePasswordProps" v-if="updatePasswordProps.dialogVisible"/>
    <updateUserInfo :updateUserInfoProps="updateUserInfoProps" @updateNewList="updateNewList" v-if="updateUserInfoProps.dialogVisible" />
  </div>
</template>

<script>
import { getusers , deleteUsers,getCompanys } from '@/api/user'
import addNewUser from './addNewUser.vue'
import updatePassword from './updatePassword.vue'
import updateUserInfo from './updateUserInfo.vue'
export default {
  components:{
    addNewUser , updatePassword , updateUserInfo
  },
  data(){
    return{
      companyListData:[],
      tableData: [],
      tableHeight:44.1 * 16,
      currentPage:1,
      formInline:{
        limit: 100,
        offset: 0,
        sort:'id-',
        company_id:'all'
      },
      total:0,
      multipleSelection: [],
      addNewUserProps:{
        dialogVisible:false
      },
      updateUserInfoProps:{
        dialogVisible:false
      },
      updatePasswordProps:{
        dialogVisible:false,
        row:null
      },
      search_params: {
        // computing_task_id: '',  //集合任务ID
        // algorithm_name: '', //算法名称
        // perception_set_name: '',//集合名称
        // sort: '-ct_time',
        sort: 'alls_precision',
        orderbysort:'-',
        computing_task_id:null
      },
    }
  },
  created(){
    this.getusersList()
    this.getCompanyList()
  },
  methods:{
    // 获取公司信息列表
    getCompanyList(){
      getCompanys().then(res=>{
        console.log(res,'ccc')
        this.companyListData = res.data
      }).catch(err=>{
        console.log(err)
      })
    },
    getusersList(){

      let data = JSON.parse(JSON.stringify(this.formInline))
      if(this.formInline.company_id =='all'){
        // data.company_id = undefined
        delete data.company_id
      }

      getusers(data).then(res=>{
        console.log(res)
        this.tableData = res.data
        this.total = res.total
      }).catch(err=>{
        console.log(err)
      })
    },
    updateUserinfoFunction(){
      if(this.multipleSelection.length > 1){
        this.$message({
          message: '仅支持编辑单个用户',
          type: 'warning'
        });
      }else if(this.multipleSelection.length == 0){
        this.$message({
          message: '您未选择需要编辑的用户',
          type: 'warning'
        });
      }else{
        this.updateUserInfoProps.row = this.multipleSelection[0]
        this.updateUserInfoProps.dialogVisible = true
      }

    },
    deleteUsers(){
      if(this.multipleSelection.length > 0){
        this.$confirm('此操作会永久删除用户信息，请检查后点击确定?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.multipleSelection.forEach((item,index) => {
            deleteUsers(item.id).then(res=>{
              //获取列表 正常状态
              this.getusersList()

            }).catch(err=>{
               //获取列表 异常状态
              this.getusersList()
            })

          });
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      }else{
        this.$message({
          message: '未选择需要删除的用户',
          type: 'warning'
        })
      }


    },
    handleSizeChange(val) {
      this.formInline.limit = val
      this.tableHeight = 45 * (val+1)
      this.getusersList()
    },
    handleCurrentChange(val) {
      this.formInline.offset = (val - 1) * this.formInline.limit
      this.getusersList()
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
    addnewUserFunction(){
      this.addNewUserProps.dialogVisible = true
    },
    updateNewList(bool){
      if(bool){
        this.getusersList()
      }
    },
    updatePasswordFunction(row){
      this.updatePasswordProps.row=row
      this.updatePasswordProps.dialogVisible=true
    }
  }
}
</script>

<style lang="scss">
#user{
  width: 100%;
  max-height: calc(100vh - 84px);
  overflow: auto;
  padding: 10px;
}
#searchUser{
  position: relative;
  top: -10px;
  // display: inline-block;
}

#searchUser .el-form-item{
  margin-bottom: -0px;
}
#searchUser2{
  position: relative;
   display: block;
}
</style>
