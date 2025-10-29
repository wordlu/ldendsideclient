<template>
  <div id="dataSetList">
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item >系统管理</el-breadcrumb-item>
      <el-breadcrumb-item>标签管理</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="panel">
      <div class="title-panel">
        <div class="info">
          <div class="info-detail">
            <b class="title">标签管理<span class="count"></span></b>
          </div>
          <div class="info-btn-group">
            <!-- <el-button type="primary" class="info-btn" @click="trigger">拉取标签</el-button> -->
            <el-button disabled class="info-btn">拉取标签</el-button>
          </div>
        </div>
      </div>
      <div class="mid-panel">
        <el-input v-model="search.input" class="search-bar" placeholder="搜索标签名称" :prefix-icon="Search" clearable />
      </div>
    </div>
    <!-- 列表 -->
    <div class="table_list">
      <tagTable :reList="reList" :search="search" @showDetailClick="showDetailClick" />
    </div>
    <el-dialog
      id="addTags"
      width="30%"
      title="新增标签"
      v-model="addTagsInnerVisibleTrip"
      :before-close="handleClose"
      append-to-body>
      <div>
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" size="mini" label-width="100px" class="demo-ruleForm">
          <el-form-item label="标签名称" prop="name">
            <el-input v-model="ruleForm.name"></el-input>
          </el-form-item>
          <el-form-item label="标签分类" prop="category">
            <el-select v-model="ruleForm.category" placeholder="请选择标签分类" @change="getIcons()">
              <el-option label="trip" value="trip"></el-option>
              <el-option label="项目" value="项目"></el-option>
              <el-option label="批次" value="批次"></el-option>
              <el-option label="自定义" value="自定义"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="tag标签样式" prop="pattern">
            <tags :icons="tripIcons" style="min-height: 34px;width:100%;padding-bottom:2px;margin-bottom:12px;border-bottom:1px solid #dad5d5"/>
          </el-form-item>
          <el-form-item label="备注" prop="notes">
            <el-input type="textarea" v-model="ruleForm.notes"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('ruleForm')">立即创建</el-button>
            <el-button @click="resetForm('ruleForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>


<script  setup>
import { ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { ArrowRight, Search, ArrowRightBold, ArrowLeftBold } from "@element-plus/icons-vue"
import { useI18n } from 'vue-i18n'

const dialogVisible = ref(false)
const { t } = useI18n()
const handleClose = (done) => {
  ElMessageBox.confirm($t(`common['确认关闭']`))
    .then(() => {
      done()
    })
    .catch(() => {
      // catch error
    })
}

const openAddtagsTrip = () => {
  ElMessage(t(`overview['没有权限修改主数据']`))
}

const trigger = () => {
  // window.history.pushState(null, '', `/loggerfe/configs`)
}


</script>
<script>

import tagTable from './tagTable/index.vue'
import { h, ref } from 'vue'
import tags from './dialog/tags.vue';
import { findAll} from '@/api/jsonApi'

import gostore from '@/services/governance-store'
export default {
  components:{
    tagTable,
    tags
    // addTripTags
  },
  data(){
    return{
      // 
      ruleForm: {
        name: '',
        category: '',
        notes: '',
        sub: 'custom',
        project:this.$route.params.id
      },
      rules: {
        name: [
          { required: true, message: '请输入标签名称', trigger: 'blur' },
          // { min: 1, max: 12, message: "名称长度在1到12个字符", trigger: "change" }
        ],
        category: [
          { required: true, message: '请选择标签分类', trigger: 'change' }
        ],
        // pattern: [
        //   { required: true, message: '请选择标签样式' }
        // ],
        notes: [
          { required: true, message: '请填写备注', trigger: 'blur' }
        ]
      },
      tripIcons: [],
      // 
      innerVisible:false,
      addTagsInnerVisibleTrip:false,
      search:{
        input:''
      },
      showFilterContent:false,
      oneClearTag:{},
      addDataProps:{
        dialogVisible:false
      },
      reList:0,
      showDetailVisible: false,
      activeRow: null
    }
  },
  methods:{
    // openAddtagsTrip(){
    //   this.$message({
    //     message: `没有权限修改主数据`,
    //     type: 'info'
    //   });
      // console.log(this.addTagsInnerVisibleTrip,'this.addTagsInnerVisibleTrip');
      // const h = this.$createElement;
      // this.addTagsInnerVisibleTrip = true
    // },
    setAddTagsInnerVisibleTrip(){
      this.addTagsInnerVisibleTrip = false
      this.reAllTagsTrip++
    },
    openAddDataDom(){
      contactMessageBox((err)=>{console.log(err)})
    },
    closeAddDataDom(){
      this.reList ++;
      this.addDataProps.dialogVisible = false
    },
    setAllTags(tags){
      this.iconsall = tags
    },
    setShowFilterContent(bool){
      this.showFilterContent = bool
    },
    clearTag(item){
      this.oneClearTag = {}
      this.oneClearTag = item
    },
    reFilter(){
      this.search.icons = []
    },
    showDetailClick(row) {
      this.showDetailVisible = true
      this.activeRow = row
    },
    closeShowDetailDialog() {
      this.showDetailVisible = false
    },
    //
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          //  this.$api['addItem']('tags',this.ruleForm).then(res=>{
          //   this.$emit('setAddTagsInnerVisible')
          //   this.$message({
          //     message: `标签 ${this.ruleForm.name} 创建成功`,
          //     type: 'success'
          //   });
          //   this.addTagsInnerVisibleTrip = false  
          //   this.reList++
          //  })
          const paramsPayload = {
            data: {
              type: 'tags',
              attributes: this.ruleForm
            }
          };
          addItem('tags', paramsPayload).then(res=>{
            this.setAddTagsInnerVisibleTrip()
            this.$message({
              message: `标签 ${this.ruleForm.name} 创建成功`,
              type: 'success'
            });
          })
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          this.$emit('setAddTagsInnerVisible')
        })
        .catch(_ => {});
    },
    getIcons(){
      // this.$api['findAll']('tags',{project:this.$route.params.id, category: this.ruleForm.category, name: this.ruleForm.category}).then(res=>{
      //   this.ruleForm.pattern = res.data[0].pattern
      //   this.ruleForm.color = res.data[0].color
      //   this.tripIcons = res.data
      // })
      findAll('tags',{category: this.ruleForm.category, name: this.ruleForm.category}).then(res=>{
        gostore.reset()
        const data = gostore.sync(res)
        if (!data || data.length === 0) return false;
        this.ruleForm.pattern = data[0].pattern
        this.ruleForm.color = data[0].color
        this.tripIcons = data
      })
    }, 
    // 
  }
}
</script>

<style lang="scss">

.panel {
    margin-top: 15px;
    flex-grow: 1;
    border: 1px solid transparent;
  }

  .mid-panel {
    display: flex;
    flex-direction: row;

    .search-bar {
      max-width: 300px;
      padding: 10px
    }

    .mid-group {
      flex-grow: 1;
      width: 100px;
      display: flex;
      flex-direction: row-reverse;
      margin: 0 15px;

      .el-button--text {
        color: #FF7900;
      }

      .el-button--text.is-disabled {
        color: rgba(255, 121, 0, 0.4);
      }


      button {
        margin: 0 15px
      }
    }
  }

  .title-panel {
    background-color: white;
    display: flex;
    flex-direction: row;

    .info {
      padding: 10px;
      width: 100%;
      display: flex;
      flex-direction: row;

      .info-detail {
        display: flex;
        flex-direction: column;
        justify-content: center;

        .title {
          padding: 4px 0;
        }

        .count {
          color: #687078;
          margin-left: 4px;
        }

        .desc {
          color: #545b64;
          font-size: 12px;
        }

        b {
          display: flex;
        }

        p {
          font-weight: 400;
          margin-top: 2px;
        }
      }

      .info-btn-group {
        flex-grow: 1;
        width: 100px;
        display: flex;
        flex-direction: row-reverse;

        .el-button--primary {
          background: #FF7900;
          border: none;
        }

        .info-btn {
          margin: 5px;
        }
      }

    }
  }
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


#dataSetList{
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 0 24px;
  // 头部
  .header{
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .btn-add{
      .el-button--primary{
        background: #FF7900;
        border-color: #FF7900;
        border-radius: 8px;
      }
    }
    .title{
      display: flex;
      align-items: center;
      .Grey-Background-box{
        width: 40px;
        height: 40px;
        background: #F3F4F7;
        border-radius: 8px;
      }
      span{
        /* Header/text-3xl/I-EL-Medium */
        font-family: 'Poppins';
        font-style: normal;
        font-weight: 600;
        font-size: 28px;
        line-height: 40px;
        /* identical to box height, or 143% */
        /* 01 Netural/N700 */
        color: #2D2F39;
        margin-left: 12px;
      }
    }
  }
  // 搜索
  .search{
    width: 100%;
    padding: 12px;
    margin-top: 40px;
    background: #F9F9FB;
    border-radius: 12px;
    display: flex;
    .search-input{
      width: 332px;
      padding-right: 12px;
      position: relative;
      .vertical{
        width: 2px;
        height: 28px;
        background: #E1E3EB;
        border-radius: 99px;
        position: absolute;
        top: 50%;
        margin-top: -14px;
        right: -1px;
      }
    }
  }
  .tags{
    margin-left: 8px;
  }
  .table_list{
    height: calc(100% - 144px);

    .el-table::before {
      background-color: transparent;
    }
  }
}
</style>