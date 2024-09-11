<template>
  <div class="log">
    <!-- <p class="title">Log</p> -->
    <div class="content">
      {{ data || $t(`common['暂无数据']`) }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: String
  },
  data() {
    return {

    }
  }
}
</script>

<style scoped lang="scss">
.log {
  // flex: 1;
  margin-left: 24px;
  .title {
    font-family: 'Poppins';
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
    color: #2D2F39;
    margin-bottom: 12px;
  }
  .content {
    height: 100%;
    width: 100%;
    overflow: auto;
    font-size: 14px;
    line-height: 32px;
    color: #606266;
    text-align: left;
    white-space: pre-line;
  }
}
</style>