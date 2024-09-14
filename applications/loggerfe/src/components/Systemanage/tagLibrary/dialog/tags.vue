<template>
  <div class="tags">
    <el-tooltip class="item" v-for="(item,index) in icons" :key="index" effect="dark" :content="item.name" placement="top">
      <span :class="`icon-item ${item.show?'icon-item-show':''}`" :style="{'background':item.color}">
        <span class="icon-item-Clearday" @click="clickTag(item,index)" >
          <img v-if="item.sub != 'custom'" :src="'/'+item.pattern" alt="" style="width:32px;height:32px">
          <span class="icon-item-Clearday-custom" v-if="item.sub == 'custom'">
            {{ item.name }}
          </span>
        </span>
        <div class="clearTag" v-if="item.show && hasClear" @click="clearTag(index,item)">
          <svg-icon icon-class="dataSetListClear" class="dataSetListClear" style="width:16px;height:16px"/>
        </div>
      </span>
    </el-tooltip>
  </div>
</template>

<script>


export default {
  props:{
    icons:Array,
    hasClear:Boolean
  },
  data(){
    return{
      origin
    }
  },
  watch:{
    icons(newVal,oldVal){
      // console.log(newVal,'newVal')
    }
  },
  created(){
    this.origin = location.origin;
  },
  mounted(){
    // console.log(this.icons,'icons')
  },
  methods:{
    clickTag(row,index){
      if(this.hasClear){
        if(row.show){
          this.$set(row,'show',false)
        }else{
          this.$set(row,'show',true)
          this.hideClearTag(index)
        }
      }
    },
    hideClearTag(idx){
      this.icons.forEach((item,index) => {
        if(index !== idx){
          this.$set(item,'show',false)
        }
      });
    },
    clearTag(index,item){
      this.icons.splice(index,1)
      this.$emit('clearTag',item)
    }
  }
}
</script>

<style lang="scss">
.tags{
  display: flex;
  // justify-content: center;
  // align-items: center;
  flex-wrap: wrap;
  .icon-item{
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 4px;
    cursor:pointer;
    height: 32px;
    margin-bottom: 1.5px;
    .icon-item-Clearday{
      // padding: 0px 6px;
      height: 32px;
      display: flex;
      align-items: center;
      &-custom{
        min-width: 32px;
        height: 100%;
        display: flex;
        padding-left: 3px;
        padding-right: 3px;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 500;
        color: #ffffff;
      }
    }
    .clearTag{
      width: 24px;
      position: relative;
      .dataSetListClear{
        position: absolute;
        right: 6px;
        top: 50%;
        margin-top: -8px;
      }
    }
  }
  .icon-item-show{
    border-radius: 8px 24px 24px 8px;
  }
}
</style>