<template>
  <div id="updateUserInfo">
    <el-dialog
        title="用户信息修改"
        :visible.sync="updateUserInfoProps.dialogVisible"
        width="30%"
        :before-close="handleClose">
        <span>
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" size="mini" label-width="100px" class="demo-ruleForm">
                <el-form-item  :label="$t('home.name')" prop="name">
                    <el-input v-model.trim="ruleForm.name"></el-input>
                </el-form-item>
                <!-- 2023 修改公司 -->
                <el-form-item :label="$t('company')" required>
                  <el-select v-model="ruleForm.company_id" placeholder="">
                    <el-option v-for="item in companyListData" :label="item.short_name" :value="item.id"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="登录ID" prop="account" required>
                    <el-input v-model.trim="ruleForm.account" disabled></el-input>
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
                    <el-button type="primary" size="mini" @click="submitForm('ruleForm')">修 改</el-button>
                    <el-button @click="updateUserInfoProps.dialogVisible = false">取 消</el-button>
                </el-form-item>
            </el-form>
        </span>
    </el-dialog>
  </div>
</template>

<script>
import { put_user_info,getCompanys} from '@/api/user'
export default {
    props:{
        updateUserInfoProps:{
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
          ]
        }
      }
    },
    created(){
      this.getCompanyList()

        this.ruleForm = JSON.parse(JSON.stringify(this.updateUserInfoProps.row))
        console.log( this.ruleForm,'ccc');
        if(this.updateUserInfoProps.row.expire_time == '9999-12-12T23:59:59'){
          delete this.ruleForm.expire_time;
        }else{
            if(this.updateUserInfoProps.row.expire_time == ''){
                this.ruleForm.expire_time = ''
            }else{
                this.ruleForm.expire_time = this.formatter(this.updateUserInfoProps.row.expire_time,"yyyy-MM-dd hh:mm:ss")
            }
        }

        // this.ruleForm.email = this.ruleForm.email?this.ruleForm.email:'@liangdao.ai'
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
				this.updateUserInfoProps.dialogVisible = false
			},
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
				if (valid) {

          if (this.ruleForm.email&&!this.ruleForm.email.includes('@liangdao')) {
            this.$message('非主公司的用户，登录ID将默认设置为其邮箱');
            this.ruleForm.account = this.ruleForm.email

          }

          this.ruleForm = JSON.parse(JSON.stringify(this.ruleForm))
          if(this.ruleForm.expire_time == null){
            this.ruleForm.expire_time = ''
          }
          let options = this.ruleForm
						put_user_info(options).then(res=>{
              this.updateUserInfoProps.dialogVisible = false
              this.$notify({
                title:  this.$store.getters.language === 'zh'?'成功':'successfully',
                message: '信息修改成功',
                type: 'success'
              });
              this.$emit('updateNewList',true)
						}).catch(err=>{
              if(err.error_message.indexOf(`for key 'account'`) !== -1){
                this.$notify({
                title: this.$store.getters.language === 'zh'?'警告':'Warning',
                message: '登录ID重复',
                type: 'warning'
                });
              }else{

                // this.$notify({
                // title: this.$store.getters.language === 'zh'?'警告':'Warning',
                // message: '信息修改失败',
                // type: 'warning'
                // });
              }
						})
				} else {
						console.log('error submit!!');
						return false;
				}
				});
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

<style>

</style>
