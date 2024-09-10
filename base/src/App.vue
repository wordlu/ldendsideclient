<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import $ from 'jquery'
export default {
  name: 'App',
  created(){
    if(this.$i18n.locale == 'ja'){
      $('.html').css('font-family','msgothic')
      $('body').css('font-family','msgothic')
    }else if(this.$i18n.locale == 'en'){
      $('.html').css('font-family','calibrii')
      $('body').css('font-family','calibrii')
    }else if(this.$i18n.locale == 'zh'){
      $('.html').css('font-family','Deng')
      $('body').css('font-family','Deng')
    }
  }
}
</script>
<style lang="scss">
//英文
@font-face {
  font-family: calibrii;
  src: url('./assets/fonts/calibrii.ttf');
}
//中文
@font-face {
  font-family: Deng;
  src: url('./assets/fonts/Deng.ttf');
}
//日文
@font-face {
  font-family: msgothic;
  src: url('./assets/fonts/MS-Gothic-01.ttf');
}
*{
  margin:0;
  padding:0;
}
html,body{
  height: 100%;
  // -webkit-user-select: none;
  // -moz-user-select: none;
  // -ms-user-select: none;
  // user-select: none;
  background:#fff;
  // font-family: "Deng";
  padding-right: 0 !important;

}
</style>
