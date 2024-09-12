<template>
  <div id="layout">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
export default {

}
</script>

<style>
#layout {
  width: 100%;
  height: calc(100vh - 80px);
  overflow: auto;
}
</style>