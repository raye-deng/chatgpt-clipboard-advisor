<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script lang="ts" setup>


</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  display: block;
  width: calc(100vw - 40px);
  height: calc(100vh - 40px);
  overflow: hidden;
  margin: 0;
  padding: 10px;
  position: relative;
}
</style>
