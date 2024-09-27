<template>
  <div id="addNewUser">
    <el-dialog
        title="新增用户"
        :visible.sync="addNewUserProps.dialogVisible"
        width="30%"
        :before-close="handleClose">
        <span>
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" size="mini" label-width="100px" class="demo-ruleForm">
                <el-form-item label="姓名" prop="name">
                    <el-input v-model.trim="ruleForm.name"></el-input>
                </el-form-item>

                <el-form-item :label="$t('company')" prop='company_id' required>
                  <el-select v-model.trim="ruleForm.company_id" placeholder="" >
                    <el-option v-for="item in companyListData" :label="item.short_name" :value="item.id"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="登录ID" prop="account" required>
                    <el-input v-model.trim="ruleForm.account"></el-input>
                </el-form-item>
                <el-form-item
                    prop="email"
                    label="邮箱"
                    :rules="[
                    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
                    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
                    ]"
                >
                    <el-input v-model="ruleForm.email"></el-input>
                </el-form-item>
                <el-form-item label="电话">
                    <el-input v-model.trim="ruleForm.phone"></el-input>
                </el-form-item>
                <el-form-item label="注销日期">
                    <el-date-picker
                    :picker-options="pickerOptions"
                    v-model="ruleForm.expire_time"
                    type="datetime"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    placeholder="选择日期时间">
                    </el-date-picker>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" size="mini" @click="submitForm('ruleForm')">立即创建</el-button>
                    <el-button @click="addNewUserProps.dialogVisible = false">取 消</el-button>
                </el-form-item>
            </el-form>
        </span>
        <!-- <span slot="footer" class="dialog-footer">
            <el-button @click="addNewUserProps.dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addUser">确 定</el-button>
        </span> -->
    </el-dialog>
  </div>
</template>

<script>
import { addUsers,getCompanys } from '@/api/user'
export default {
    props:{
        addNewUserProps:{
            type:Object
        }
    },
    data(){
        return{
          companyListData:[],
            pickerOptions: {
                disabledDate(time) {
                    return time.getTime() < Date.now() - 8.64e7;
                },
            },
            ruleForm: {

            },
            rules: {
                name: [
                    { required: true, message: '请输入名称', trigger: 'blur' },
                    { min: 2, max: 40, message: '长度在 2 到 40 个字符', trigger: 'blur' }
                ],
                company_id: [
                    { required: true, message: '请选择公司', trigger: 'change' }
                ],
                region: [
                    { required: true, message: '请选择部门', trigger: 'change' }
                ],
                account: [
                    { required: true, message: '请输入登录ID', trigger: 'blur' },
                    { min: 2, max: 40, message: '长度在 2 到 40 个字符', trigger: 'blur' }
                ],
                date1: [
                    { type: 'date', required: true, message: '请选择日期', trigger: 'change' }
                ],
                date2: [
                    { type: 'date', required: true, message: '请选择时间', trigger: 'change' }
                ],
            }
        }
    },
    methods:{
       // 获取公司信息列表
      getCompanyList(){
        getCompanys().then(res=>{
          // console.log(res,'ccc')
          this.companyListData = res.data
        }).catch(err=>{
          console.log(err)
        })
      },
        handleClose(){
            this.addNewUserProps.dialogVisible = false
        },
        submitForm(formName) {
            this.$refs[formName].validate((valid) => {
            if (valid) {
              if (this.ruleForm.email&&!this.ruleForm.email.includes('@liangdao')) {
                this.$message('非主公司的用户，登录ID将默认设置为其邮箱');
                this.ruleForm.account = this.ruleForm.email

              }

                addUsers(this.ruleForm)
                .then(res=>{
                    this.addNewUserProps.dialogVisible = false
                    this.$notify({
                        title:  this.$store.getters.language === 'zh'?'成功':'successfully',
                        message: '用户创建成功',
                        type: 'success'
                    });
                    this.$emit('updateNewList',true)
                }).catch(err=>{
                    // 移除重复的提示
                    console.log(err)
                    // if(err.error_message.indexOf(`for key 'account'`) !== -1){
                    //     this.$notify({
                    //     title: this.$store.getters.language === 'zh'?'警告':'Warning',
                    //     message: '登录ID重复',
                    //     type: 'warning'
                    //     });
                    // }else if(err.error_message.indexOf(`Duplicate entry`) !== -1){
                    //     this.$notify({
                    //     title: this.$store.getters.language === 'zh'?'警告':'Warning',
                    //     message: '该邮箱账户已被注册，可前往列表页查看',
                    //     type: 'warning'
                    //     });
                    // }else{

                    //     // this.$notify({
                    //     //   title: this.$store.getters.language === 'zh'?'警告':'Warning',
                    //     //   message: err.error_message,
                    //     //   type: 'warning'
                    //     // });
                    // }

                })
            } else {
                console.log('error submit!!');
                return false;
            }
            });
        },
        addUser(){

        }
    },
    created () {
      this.getCompanyList()
    }
}
</script>

<style>

</style>
