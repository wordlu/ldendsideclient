<template>
  <div class="tags">
    <el-tooltip class="item" v-for="(item,index) in getArrangeIcons(icons)" :key="index" effect="dark" :content="item.name" placement="top">
      <span :class="`icon-item ${item.show?'icon-item-show':''}`" :style="{'background':item.color}">
        <span class="icon-item-Clearday" @click="clickTag(item,index)" >
          <img v-if="item.sub != 'custom'" :src="reqip+'/'+item.pattern" alt="" style="width:32px;height:32px">
          <span v-if="item.sub == 'custom'" class="icon-item-Clearday-custom">
            {{ item.name }}
          </span>
        </span>
      </span>
    </el-tooltip>
    <el-dropdown v-show="icons.length > 6">
      <span class="el-dropdown-link">
        <el-icon class="el-icon--right"><MoreFilled /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <div class="more-icon-area">
            <el-tooltip class="item" v-for="(item,index) in getMoreIcons(icons)" :key="index" effect="dark" :content="item.name" placement="top">
              <span :class="`icon-item ${item.show?'icon-item-show':''}`" :style="{'background':item.color}">
                <span class="icon-item-Clearday" @click="clickTag(item,index)" >
                  <img v-if="item.sub != 'custom'" :src="'/'+item.pattern" alt="" style="width:32px;height:32px">
                  <span v-if="item.sub == 'custom'" class="icon-item-Clearday-custom">
                    {{ item.name }}
                  </span>
                </span>
              </span>
            </el-tooltip> 
          </div>
                     
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>
<script setup>
  import { More, MoreFilled } from '@element-plus/icons-vue'
</script>
<script>
export default {
  props:{
    icons:Array,
    hasClear:Boolean,
    arrangeNumber: Number,
    reqip: String
  },
  components: { More, MoreFilled },
  data(){
    return{
      origin
    }
  },
  created(){
    this.origin = location.origin;
  },
  mounted(){
    
  },
  methods:{
    getMoreIcons(icons) {
      return icons.slice(this.arrangeNumber, icons.length+1)
    },
    getArrangeIcons(icons) {
      if (icons.length > this.arrangeNumber) {
        return icons.slice(0, this.arrangeNumber)
      }
      return icons
    },
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
    }
  }
}
</script>

<style lang="scss">
.more-icon-area {
  width: 196px;
  display: flex;
  flex-wrap: wrap;
  padding: 6px;
}
.tags{
  display: flex;
  // justify-content: center;
  align-items: center;
  flex-wrap: wrap;

  .more {
    width: 32px;
    cursor: pointer;
  }
}
.icon-item{
  border-radius: 8px;
  min-width: 32px;
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
      height: 100%;
      width: 100%;
      display: flex;
      align-items: center;
      padding-left: 3px;
      padding-right: 3px;
      justify-content: center;
      top: 0;
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
</style>