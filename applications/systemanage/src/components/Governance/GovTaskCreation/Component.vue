<template>
  <div class="container">
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/governance/overview' }">{{$t(`Menu['治理集成']`)}}</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/governance/tasks' }">{{$t(`Menu['治理任务']`)}}</el-breadcrumb-item>
      <el-breadcrumb-item>{{$t(`overview['手动触发']`)}}</el-breadcrumb-item>
    </el-breadcrumb>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="form" status-icon>
      <el-form-item :label="$t(`overview['任务名']`)" prop="name">
        <el-input v-model="form.name"  />
      </el-form-item>
      <el-form-item :label="$t(`overview['任务描述']`)">
        <el-input v-model="form.desc" prop="desc"/>
      </el-form-item>
      <el-form-item :label="$t(`overview['方案']`)" prop="proposal">
        <el-select @change="selectProposal" v-model="form.proposal" :placeholder="$t(`overview['请选择方案']`)" style="width: 100%">
          <el-option v-for="item in proposalArray" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <div class="summary" v-show="proposalDetails">
        <el-tabs v-model="activeName" class="user-tabs" @tab-click="handleClick">
            <el-tab-pane :label="$t(`overview['输入']`)" name="input">
              <DsInput :details="proposalDetails"></DsInput>
            </el-tab-pane>
            <el-tab-pane :label="$t(`overview['治理详情']`)"  name="governance">
              <ProposalDetail :details="proposalDetails"></ProposalDetail>
            </el-tab-pane>
            <el-tab-pane :label="$t(`overview['输出']`)" name="output">
              <DsOutput :details="proposalDetails"></DsOutput>
            </el-tab-pane>
        </el-tabs>
    </div>
      <el-form-item class="btns">
        <el-button type="primary" @click="submitForm(formRef)">{{ $t(`common['确认']`) }}</el-button>
        <el-button @click="cancel">{{ $t(`common['取消']`) }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import axios from "axios"
import { ArrowRight } from "@element-plus/icons-vue"
import { ref, reactive, computed } from "vue"
import gostore from '@/services/governance-store'
import { findAll } from '@/api/jsonApi'
import { funcGovernanceTask } from '@/api/api'
import jsCookie from 'js-cookie'
import { ElMessage } from 'element-plus'
import type { FormRules, TabsPaneContext } from "element-plus"
import DsInput from "./Input.vue"
import DsOutput from "./Output.vue"
import ProposalDetail from "./ProposalDetail.vue"
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Row {
  proposal: '',
  name: '',
  desc: ''
}

const formRef = ref()
const proposalDetails = ref<any>(null)
const activeName = ref<string>("input")
// const formSize = ref('default')
const form = reactive<Row>({
  proposal: '',
  name: '',
  desc: ''
})


const handleClick = (tab: TabsPaneContext, event: Event) => {
    console.log(tab, event)
    activeName.value = tab.paneName 
}

const rules = computed(() => {
  return {
    proposal: [
      { required: true, message: t(`overview['请选择方案']`), trigger: 'blur' },
    ],
    name: [
      { required: true, message: t(`overview['请选择任务名称']`), trigger: 'blur' },
    ]
  }
})

const proposalArray = ref<any>([])

const selectProposal = (val:any) => {
  const data = proposalArray.value.find((it:any) => it.id === val)
  proposalDetails.value = data
}

const submitForm = async (formEl: any) => {
  console.log(formEl)
  if (!formEl) return
  await formEl.validate((valid: any, fields: any) => {
    if (valid) {
      creation()
    } else {
      console.log('error submit!', fields)
    }
  })
}

const creation = () => {
  try {
    const params = {
      "proposal-id": form.proposal,
      "cat": "手动",
      "name": form.name,
      "desc": form.desc
    }
    funcGovernanceTask(params).then((res) => {
      ElMessage({
        message: t(`overview['手动触发任务成功']`),
        type: 'success',
      })
      window.history.pushState(null,'',`/governance/tasks`)
    }).catch(err => {
      let msg = t(`common['操作失败']`)
      const {response:{data:{errors}}} = err
      if(errors && errors[0]) {
        msg = errors[0]['detail']
      }
      ElMessage({
        message: msg,
        type: 'error',
      })
    })
  } catch (error) {
    console.log(error)
  }
}

const cancel = () => {
  window.history.pushState(null, '', `/governance/tasks`)
}

const queryGovTasksData = () => {
  try {
    findAll('proposals', {}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      proposalArray.value = gostore.findAll('proposals')
    }).catch((err: any) => {
      console.log(err, 'err')
    })
  } catch (error) {
    console.log(error)
  }
}

queryGovTasksData()

</script>

<style lang="scss" scoped>
.ver-mid {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.el-button--primary {
  background: #FF7900;
  border: none;
}


.el-tabs__item.is-active {
  color: #FF7900;
}
.container {
  display: flex;
  flex-direction: column;
  margin: 0 30px;

  .btns {
    padding-top: 40px;
  }

  .bread-font {
    font-weight: 700;
  }

  .form {
    margin-top: 15px;
    flex-grow: 1;
    border: 1px solid transparent;
    // display: flex;
    // flex-direction: row;

    .summary {
      padding-left: 80px;
    }
  }
}
</style>