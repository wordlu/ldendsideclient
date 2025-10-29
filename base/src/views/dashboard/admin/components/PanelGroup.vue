<template>
  <el-row :gutter="32" class="panel-group">
    <el-col :xs="24" :sm="24" :lg="8" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('newVisitis')">
        <div class="card-panel-icon-wrapper icon-people">
          <i class="el-icon-truck" style="font-size:50px" />
        </div>
        <div class="card-panel-description card-panel-description-item">
          <div style="font-size:20px;text-align: center;">
            <!-- 里程 -->
            {{$t('home.Distance')}}
          </div>
          <div class="card-panel-item">
            <div class="card-panel-item-text">
              <!-- 可用占比 -->
              {{$t('home.Percentage_useful')}}
            </div>
            <count-to :start-val="0" :end-val="TotalObj.available_km_percent" :duration="1000" :decimals="2" class="card-panel-num" /> <span style="margin-left:3px"> % </span>
          </div>

          <div class="card-panel-item">
            <div class="card-panel-item-text">
              <!-- 可用里程 -->
              {{$t('home.Distance_useful')}}
            </div>
            <count-to :start-val="0" :end-val="TotalObj.available_km" :duration="1000" :decimals="2" class="card-panel-num"/> <span style="margin-left:3px"> km </span>
          </div>

          <div class="card-panel-item">
            <div class="card-panel-item-text">
              <!-- 入库里程 -->
              {{$t('home.Distance_storage')}}
            </div>
            <count-to :start-val="0" :end-val="TotalObj.total_km" :duration="1000" :decimals="2" class="card-panel-num" /> <span style="margin-left:3px"> km </span>
          </div>
        </div>
      </div>
    </el-col>
    <el-col :xs="24" :sm="24" :lg="8" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('messages')">
        <div class="card-panel-icon-wrapper icon-message">
          <i class="el-icon-time"  style="font-size:50px" />
        </div>
        <div class="card-panel-description card-panel-description-item">
          <div style="font-size:20px;text-align: center;">
            <!-- 时长 -->
            {{$t('home.duration')}}
          </div>

          <div class="card-panel-item">
            <div class="card-panel-item-text">
              <!-- 可用占比 -->
              {{$t('home.Percentage_useful')}}
            </div>
            <count-to :start-val="0" :end-val="TotalObj.available_hour_percent" :duration="1000" :decimals="2" class="card-panel-num" /> <span style="margin-left:3px"> % </span>
          </div>

          <div class="card-panel-item">
            <div class="card-panel-item-text">
              <!-- 可用时长 -->
              {{$t('home.Time_useful')}}
            </div>
            <count-to :start-val="0" :end-val="TotalObj.available_hour" :duration="1000" :decimals="2" class="card-panel-num" /> <span style="margin-left:3px"> h </span>
          </div>

          <div class="card-panel-item">
            <div class="card-panel-item-text">
              <!-- 入库时长 -->
              {{$t('home.Time_storage')}}

            </div>
            <count-to :start-val="0" :end-val="TotalObj.total_hour" :duration="1000" :decimals="2" class="card-panel-num" /> <span style="margin-left:3px"> h </span>
          </div>

        </div>
      </div>
    </el-col>
    <el-col :xs="24" :sm="24" :lg="8" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('purchases')">
        <div class="card-panel-icon-wrapper icon-money">
          <i class="el-icon-monitor" style="font-size:50px" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            {{$t('home.averageVelocity')}}

          </div>
          <count-to :start-val="0" :end-val="TotalObj.TotalAverage_speed" :duration="1000" :decimals="1" class="card-panel-num" />
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'

export default {
  data(){
    return{
      startVal: 0,
      endVal: 0
    }
  },
  props:{
    TotalObj: {
      type: Object
    }
  },
  components: {
    CountTo
  },
  mounted(){

  },
  methods: {
    handleSetLineChartData(type) {
      this.$emit('handleSetLineChartData', type)
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }
  .card-panel-description-item{
    display: flex;
    flex: 1;
    flex-direction: column;
    align-content: center;
  }
  .card-panel-item{
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3px 0;
    .card-panel-item-text {
      line-height: 18px;
      color: rgba(0, 0, 0, 0.45);
      font-size: 16px;
      margin-bottom: 0px;
    }
  }

  .card-panel {
    height: 150px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-money {
        background: #f4516c;
      }

      .icon-shopping {
        background: #34bfa3
      }
    }

    .icon-people {
      color: #40c9c6;
    }

    .icon-message {
      color: #36a3f7;
    }

    .icon-money {
      color: #f4516c;
    }

    .icon-shopping {
      color: #34bfa3
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width:550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
