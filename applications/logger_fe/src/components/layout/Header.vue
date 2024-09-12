<template>
  <!-- 顶部标题栏 -->
  <div class="title">
    <router-link to="/">
      <img class="logo" src="/ld_logo.png" alt="logo" />
    </router-link>
    <span>{{ props.title }}</span>
  </div>
  <div class="right-content">
    <Icon
      class="icon"
      :class="{ selected: langVal === 'zh-CN' }"
      icon="icon-park-outline:chinese"
      @click="togLangVal('zh-CN')" />
    <Icon
      class="icon"
      :class="{ selected: langVal === 'en' }"
      icon="icon-park-solid:english"
      @click="togLangVal('en')" />

    <!-- 用户自定义区域 -->
    <div class="user-content">
      <slot name="userContent"></slot>
    </div>
  </div>
  <slot></slot>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

const router = useRouter()

// 定义属性
interface Props {
  title: string
}
const props = defineProps<Props>()

// 本地语言的值
const langVal = ref<string>(localStorage.getItem('lang') || 'zh-CN')
console.log(langVal.value)

// 切换语言
const togLangVal = (val: string) => {
  console.log(val, langVal.value)
  if (val === langVal.value) return
  localStorage.setItem('lang', val)
  router.go(0)
}
</script>

<style scoped lang="scss">
.title {
  display: flex;
  align-items: center;
  a {
    display: flex;
    align-items: center;
  }
  .logo {
    height: 50px;
    width: 50px;
    margin-left: 10px;
  }
  span {
    margin-left: 15px;
  }
}

.right-content {
  display: flex;
  align-items: center;
  .icon {
    font-size: 28px;
    margin-right: 1rem;
    cursor: pointer;
    &.selected {
      color: $color-primary;
    }
    &.set {
      margin-left: 1rem;
    }
  }
  .el-select {
    margin-right: 10px;
    width: 110px;
  }
  .user-content {
    margin-right: 10px;
    text-align: center;
  }
}
</style>
