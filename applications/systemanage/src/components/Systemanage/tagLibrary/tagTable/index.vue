<template>
  <div class="tag_table">
    <el-table
      :data="tableData"
      stripe
      style="width: 100%;height: calc(100% - 70px);overflow: auto;">
      <el-table-column
        label="标签"
        width="210px">
        <template #default="scope">
          <div class="table-icon">
            <span class="icon-item" >
              <img  v-if="scope.row.sub != 'custom'" :src="'/'+scope.row.pattern" style="width: 32px;height: 32px;" alt="" >
              <span class="icon-item-custom" v-if="scope.row.sub == 'custom'" :style="{'background':scope.row.color}">
                {{ scope.row.name }}
              </span>
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="size"
        align="center"
        label="标签名称">
        <template #default="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column
        prop="updated"
        label="备注">
        <template #default="scope">
          <!-- {{ scope.row.notes }} -->
          {{ scope.row.category }}
        </template>
      </el-table-column>
      <el-table-column
        prop="updated"
        label="时间">
        <template #default="scope">
          {{ formatter(scope.row.created,"yyyy-MM-dd hh:mm:ss") }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="50px">
        <template>
          <el-dropdown trigger="click" @click="handleCommand">
            <span class="el-dropdown-link">
              <el-icon class="el-icon--right"><MoreFilled /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :icon="Plus">Action 1</el-dropdown-item>
                <el-dropdown-item :icon="CirclePlusFilled">
                  Action 2
                </el-dropdown-item>
                <el-dropdown-item :icon="CirclePlus">Action 3</el-dropdown-item>
                <el-dropdown-item :icon="Check">Action 4</el-dropdown-item>
                <el-dropdown-item :icon="CircleCheck">Action 5</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

        </template>
      </el-table-column>
    </el-table>

    <div class="paging">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        v-model:current-page.sync="currentPage"
        :page-size="10"
        layout="prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { h, ref } from 'vue'
import { findAll} from '@/api/jsonApi'

import gostore from '@/services/governance-store'
import { ElMessageBox, ElSwitch } from 'element-plus'
export default {
  props:{
    search:Object,
    iconsall:Array,
    reList:Number
  },
  data(){
    return{
      tableData:[],
      currentPage:0,
      total:0,
      activeRow:{},
      params:{
        offset:0,
        limit:10,
        project:this.$route.params.id,
        sort:'-created'
      }
    }
  },
  watch:{
    reList(newVal){
      this.getList()
    },
    search:{
      handler(newVal){
        if(newVal.input !== '' || newVal.input){
          this.params.fuzzyMatch = [
            'name',newVal.input
          ]
        }else{
          delete this.params.fuzzyMatch
        }
        this.getList()
      },
      deep: true
    }
  },
  created(){
    this.getList()
  },
  methods: {
    filterTags(tags){
      let tagsArr = []
      let iconsall = this.iconsall;
      for(let i=0;i<tags.length;i++){
        for(let j=0;j<iconsall.length;j++){
          if(iconsall[j].id == tags[i]){
            tagsArr.push(iconsall[j])
          }
        }
      }
      return tagsArr;
    },  
    // getList(){
    //   this.$api['findAll']('tags',this.params).then(res=>{
    //     this.total = res.count
    //     this.tableData = res.data
    //   })
    // },
    getList(){
      findAll('/models/tags',this.params).then((res)=>{
        gostore.reset()
        gostore.sync(res.data)
        this.tableData = gostore.findAll('tags')
        this.total = res.data.meta.count
      }).catch(error=>{
        console.log(error)
      })
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      this.params.offset = this.params.limit * (val - 1)
      console.log(`当前页: ${val}`);
      this.getList()
    },
    handleCommand(command, row) {
      ElMessageBox({
        title: '联系客服',
        message: h('p', null, [
          h('span', { style: 'color: #5A5E72;fontSize: 14px' }, 'The human experience is far larger and richer than just running around and busy to the limit  '),
          h('span', { style: 'color: #FF7900' }, '000-000 0000')
        ]),
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            done();
          } else {
            done();
          }
        }
      }).then(action => {
        
      }).catch(()=>{
        
      })
    },
    toDataInfo(row){
      console.log(row,'toDataInfo')
    },
    handleClick(e){
      this.activeRow = e
    },
    byteToTB(e){
        let byte = e
        if(byte > 0){
            let kb = byte / 1024
            if(kb >= 1024){
                let mb = kb / 1024
                if(mb >= 1024){
                    let gb = mb / 1024
                    if(gb >= 1024){
                      let tb = gb / 1024
                      return tb.toFixed(1) + 'TB'
                    }else{
                      return gb = gb.toFixed(1)+'GB'
                    }
                }else{
                    return mb = mb.toFixed(1)+'MB'
                }
            }else{
                return kb = kb.toFixed(1)+'KB'
            }
        }else{
            return '0KB'
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
  },
}
</script>

<style lang="scss">
.el-message-box{
  width: 480px;
  height: 192px;
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

.tag_table{
  height: 100%;
  padding-top: 15px;
  .el-table__header-wrapper{
    display: none;
  }
  .table-icon{
    .icon-item{
      min-width: 32px;
      height: 32px;
      border-radius: 8px;
      margin-left: 12px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor:pointer;
      margin-bottom: 12px;
      .icon-item-custom{
        min-width: 32px;
        border-radius: 6px;
        padding-left: 3px;
        padding-right: 3px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        font-size: 12px;
        font-weight: 500;
        color: #ffffff;
      }
    }
  }
  .paging{
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 20px;
  }
  .cell{
    // width: 240px;
    font-family: 'Noto Sans SC';
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;
    /* or 157% */

    /* 01 Netural/N700 */

    color: #2D2F39;


    /* Inside auto layout */

    flex: none;
    order: 0;
    flex-grow: 0;
  }
}

</style>