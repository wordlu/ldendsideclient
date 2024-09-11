<template>
  <div class="container">
    <div class="panel">
      <!-- <div class="title-panel">
        <div class="info">
          <div class="info-detail">
            <b>治理任务</b>
          </div>
          <div class="info-btn-group">
            <el-button type="info" plain class="info-btn" >添加权限</el-button>
            <el-button type="info" plain class="info-btn" :disabled="isDeleteBtnDisabled">删除</el-button>
            <el-button type="info" plain class="info-btn">刷新</el-button>
          </div>
        </div>
      </div> -->
      <div class="mid-panel">
        <!-- 治理任务介绍 -->
        <!-- 质量介绍 -->
        <!-- 画图说明等 -->
        <!-- 直接写死 -->
        <div class="md-content-gover" v-html="descriptionMData"></div> 
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue"
import showdown from 'showdown'
import { getMdData } from '@/api/api';
// @ts-ignore 
import { ArrowRight, Search } from "@element-plus/icons-vue" // eslint-disable-line

const descriptionMData = ref('')
const props = defineProps({
  details: {}
})

watch(
  () => props.details,
  (count, prevCount) => {
    getMDContent(count)
  }
)

const mdToHtml = (text) => {
  const converter = new showdown.Converter()
  return converter.makeHtml(text);
}

const getMDContent = (data) => {
  if (data.id === "SINA805c9baa") {
    // 测讯
    getMdData({ path: 'icon/default/cexun.md'}).then(data => {
      console.log(data)
      descriptionMData.value = mdToHtml(data.data)
    })
  } else if (data.id === "SINA9a94d661") {
    // 长安
    getMdData({ path: 'icon/default/changan.md'}).then(data => {
      console.log(data)
      descriptionMData.value = mdToHtml(data.data)
    })
  } else if (data.id === "SINAef056b9a") {
    // 逐鹿
    getMdData({ path: 'icon/default/zhulu.md'}).then(data => {
      console.log(data)
      descriptionMData.value = mdToHtml(data.data)
    })
  }
}

</script>

<style lang="scss" scoped>
.user-tabs>.el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.ver-mid {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.container {
  display: flex;
  flex-direction: column;
  margin: 0 30px;

  .bread-font {
    font-weight: 700;
  }

  .panel {
    margin-top: 15px;
    flex-grow: 1;
    // border: 1px solid transparent;
  }

  .mid-panel {
    display: flex;
    flex-direction: row;

    .md-content-gover {
      color: #5A5E72;
      overflow: auto;
      // line-height: 30px;
      // padding: 12px 24px;
      // margin-top: 20px;
      text-align: left;

      h1, h2, h3, h4 {
        color: #2D2F39;
        line-height: 28px;
      }
      h2 {
        margin: 10px !important;
      }
      p {
        margin: 10px 30px !important;
      }
      * {
        white-space: pre-wrap;
      }
    }
  }

  .title-panel {
    // background-color: white;
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

        .info-btn {
          margin: 5px;
        }
      }
    }
  }

  .summary {
    margin-top: 15px;
    border: 1px soild transparent;
    display: flex;
    flex-direction: column;
  }
}
</style>