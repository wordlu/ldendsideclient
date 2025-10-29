<template>
  <div class="svg-container">
    <svg
      width="150"
      height="150"
      viewBox="0 0 150 150"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- 原点 -->
      <circle cx="75" cy="75" r="2" fill="#052b64" />

      <!-- X 轴（向上） -->
      <line
        x1="75" y1="75"
        x2="75" y2="20"
        stroke="#052b64"
        stroke-width="2.5"
        marker-end="url(#arrow)"
      />
      <text
        x="70" y="10"
        fill="#052b64"
        font-size="14"
        font-family="Arial"
      >X</text>

      <!-- Y 轴（向左） -->
      <line
        x1="75" y1="75"
        x2="20" y2="75"
        stroke="#052b64"
        stroke-width="2.5"
        marker-end="url(#arrow)"
      />
      <text
        x="1" y="80"
        fill="#052b64"
        font-size="14"
        font-family="Arial"
      > Y </text>

      <!-- Z 轴（俯视朝上，用圆表示） -->
      <circle
        cx="75"
        cy="75"
        r="12"
        stroke="#052b64"
        stroke-width="2.5"
        fill="none"
      />
      <text
        x="90" y="78"
        fill="#052b64"
        font-size="14"
        font-family="Arial"
      >Z</text>

      <!-- 箭头定义 -->
      <defs>
        <marker
          id="arrow"
          markerWidth="8"
          markerHeight="8"
          refX="4"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill="#052b64" />
        </marker>
      </defs>
    </svg>
  </div>
</template>

<script setup lang="ts">
// 无需 JS 逻辑，仅静态图例
</script>

<style scoped>
.svg-container {
  margin-top: 60px;
  margin-left: 60px;
}
</style>
