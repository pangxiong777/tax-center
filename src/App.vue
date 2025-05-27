<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// 根组件，使用 router-view 来渲染路由匹配的组件
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'PingFang SC', 'Helvetica Neue', 'Microsoft YaHei', sans-serif;
  background-color: #f9fafb;
}

#app {
  min-height: 100vh;
}

/* 确保路由过渡动画正常工作 */
.router-link-active {
  color: #2563eb;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
