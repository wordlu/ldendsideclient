<template>
  <div id="increaseNewUser" v-if="createdDom">
    <el-dialog
      title="新增用户"
      :visible.sync="increaseNewUserProps.dialogVisible"
      width="1200"
      :before-close="handleClose">
      <span>
        <div class="search_from">
          <span class="search_item">
              <!-- <label>{{$t('company')}}：</label> -->
              <label>公司：</label>
              <el-select v-model="searchFrom.company_id" size="mini" @change="searchList_company_id" clearable @clear="delete searchFrom.company_id; searchList()" placeholder="全部">
                      <el-option v-for=" item  in  companyListData " :label=" item.short_name " :value=" item.id "></el-option>
              </el-select>
            </span>
          <span class="search_item">
            <label>姓名：</label>
            <el-input
              placeholder="请输入"
              v-model="searchFrom.name"
              size="mini"
              @input="searchList"
              @clear="total = tableData.length;searchList_company_id()"
              clearable>
            </el-input>
          </span>
          <span class="search_item">
            <label>用户组：</label>
            <el-select v-model="searchFrom.group" size="mini" @change="getRoleItemList" clearable @clear="delete searchFrom.group;getusersList()" placeholder="全部">
              <el-option
                v-for="item in options"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </span>
        </div>

        <div>
          <el-table
            ref="multipleTable"
            :data="tableData.slice((currentPage-1)*100,currentPage*100)"
            :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
            tooltip-effect="dark"
            style="width: 100%"
            border
            @selection-change="handleSelectionChange">
            <el-table-column
              type="selection"
              width="55">
            </el-table-column>
            <el-table-column
              label="公司">
              <template slot-scope="scope">{{ scope.row.company_short_name }}</template>
            </el-table-column>
            <el-table-column
              label="名称"
              width="250">
              <template slot-scope="scope">{{ scope.row.account }}</template>
            </el-table-column>
            <el-table-column
              prop="email"
              label="邮箱">
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
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="increaseNewUserProps.dialogVisible = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="submitForm">提 交</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getusers , getRoleGroupe , getRoleItem , putBond_user ,getCompanys} from '@/api/user'
export default {
  props:{
    increaseNewUserProps:{
      type:Object
    }
  },
  data(){
    return{
      companyListData:[],
      input:'',
      users:'',
      selectFrom:{
        limit:0,
        offset:0,
      },
      searchFrom:{
        group:null
      },
      total:0,
      tableData:[],
      tableDataBack:[],
      multipleSelection:[],
      options:[],
      currentPage:1,
      createdDom:true
    }
  },
  computed: {
    searchData: function () {
      var search = this.search;
      var searchVal = '';
      if (search) {
        searchVal = this.products.filter(function (product) {
          return Object.keys(product).some(function (key) {
            return String(product[key]).toLowerCase().indexOf(search) > -1;
          })
        })
        return searchVal;
      }
    }
  },
  created(){
    // this.searchFrom.group = this.increaseNewUserProps.group
    this.getCompanyList()
  },
  mounted(){
    this.$nextTick(()=>{
      this.getRoleItemList()
      this.getRoleGroupeList()
    })

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
    getRoleGroupeList(){
      getRoleGroupe().then(res=>{
        this.options = res.data
      }).catch(err=>{

      })
    },
    getRoleItemList(){

      if(this.searchFrom.group){
        getRoleItem(this.searchFrom.group).then(res=>{
          this.tableData = res.users
          this.tableDataBack = res.users
          this.total = res.users.length
          this.searchList()
        })
      }else{
        this.getusersList()
      }
    },
    submitForm(){
      if(this.multipleSelection.length !== 0){
        this.multipleSelection.forEach(async item=>{
          await putBond_user({
            role_id:this.increaseNewUserProps.group,
            user_id:item.id
          }).then(res=>{

          }).catch(err=>{
            console.log(err)
          })
        })
        this.$notify({
          title:  this.$store.getters.language === 'zh'?'成功':'successfully',
          message: '用户新增成功',
          type: 'success'
        });
        this.increaseNewUserProps.dialogVisible = false
        this.$emit('getNewUserlist')
      }else{
        this.$message({
          message: '您未选择需要添加的用户',
          type: 'warning'
        });
      }
    },
    handleClose(){
      this.increaseNewUserProps.dialogVisible = false
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
      this.currentPage = val
      this.$forceUpdate()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    searchList(){
      let name = this.searchFrom.name
      let company_id = this.searchFrom.company_id
      let searchVal = '';
      this.tableData = this.tableDataBack
      if (name) {
        searchVal = this.tableData.filter(function (product) {
          return Object.keys(product).some(function (key) {
            return String(product[key]).toLowerCase().indexOf(name) > -1;
          })
        })

        // searchVal = this.tableData.filter(item => item.account.includes === name);
        if (company_id) {
          searchVal = searchVal.filter(item => item.company_id === company_id);
        }
        this.tableData = searchVal
        this.total = searchVal.length
        this.currentPage = 1
      }
    },
    searchList_company_id(){
      let name = this.searchFrom.name
      let company_id = this.searchFrom.company_id

      let searchVal = '';
      this.tableData = this.tableDataBack
      if (company_id) {
        // searchVal = this.tableData.filter(function (product) {
        //   return Object.keys(product).some(function (key) {
        //     return String(product[key]).toLowerCase().indexOf(company_id) > -1;
        //   })
        // })
        searchVal = this.tableData.filter(item => item.company_id === company_id);

        if (name) {
          searchVal =searchVal.filter(function (product) {
            return Object.keys(product).some(function (key) {
              return String(product[key]).toLowerCase().indexOf(name) > -1;
            })
          })
        }


        this.tableData = searchVal
        this.total = searchVal.length
        this.currentPage = 1
      }

      console.log(company_id,searchVal,'searchList_company_id');
    },
    getusersList(){
      getusers(this.selectFrom).then(res=>{
        this.tableData = res.data
        this.tableDataBack = res.data
        this.total = res.data.length
        this.searchList()
      })
    }
  }
}
</script>

<style lang="scss">
#increaseNewUser{
  .search_from{
    display: flex;
    margin-bottom: 10px;
    .search_item{
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 15px;
      label{
        width:90px;
        text-align: right;
      }
    }
  }
}
</style>
