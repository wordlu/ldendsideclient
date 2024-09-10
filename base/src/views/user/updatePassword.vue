<template>
  <div id="updateNewPassword">
    <el-dialog
        title="修改密码"
        :visible.sync="updatePasswordProps.dialogVisible"
        width="30%"
        :before-close="handleClose">
        <span>
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
                <el-form-item label="新密码" prop="password">
                    <el-input type="password" size="mini" v-model.trim="ruleForm.password" autocomplete="off" show-password></el-input>
                </el-form-item>
                <el-form-item label="确认新密码" prop="password" autocomplete="off" show-password>
                    <el-input type="password" size="mini" v-model.trim="ruleForm.newpassword" autocomplete="off" show-password></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button size="mini" type="primary" @click="submitForm('ruleForm')">提交</el-button>
                    <el-button size="mini" @click="updatePasswordProps.dialogVisible = false">取 消</el-button>
                </el-form-item>
            </el-form>
        </span>
    </el-dialog>
  </div>
</template>

<script>
import md5 from 'js-md5';
import {putUsers} from '@/api/user'
export default {
    props:{
        updatePasswordProps:{
            type:Object
        }
    },
    data(){
        return{
            ruleForm:{

            },
            rules: {
                password: [
                { required: true,message:'请输入新密码', trigger: 'change' },
                { min: 6, max: 50, message: '长度在 6 到 50 个字符', trigger: 'blur' }
                ],
                newpassword: [
                { required: true, trigger: 'blur',message:'请重新确认新密码' },
                { min: 6, max: 50, message: '长度在 6 到 50 个字符', trigger: 'blur' }
                ],
            }
        }
    },
    methods:{
        handleClose(){
            this.updatePasswordProps.dialogVisible = false
        },
        submitForm(formName) {
            this.$refs[formName].validate((valid) => {
            if (valid) {
                if(this.ruleForm.password !== this.ruleForm.newpassword){
                    this.$message({
                        message: '两次输入密码不一致',
                        type: 'warning'
                    });
                }else{
                    let options={
                        user_id:this.updatePasswordProps.row.id,
                        password:this.ruleForm.password
                    }
                    putUsers(options).then(res=>{
                        this.$notify({
                            title:  this.$store.getters.language === 'zh'?'成功':'successfully',
                            message: '新密码修改成功',
                            type: 'success'
                        });
                        this.updatePasswordProps.dialogVisible = false
                    }).catch(err=>{
                        this.$notify({
                            title: this.$store.getters.language === 'zh'?'警告':'Warning',
                            message: '修改失败',
                            type: 'warning'
                        });
                    })
                }
            } else {
                console.log('error submit!!');
                return false;
            }
            });
        },
    }
}
</script>

<style>

</style>
