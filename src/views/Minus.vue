<template>
  <div class="minus-container">
    <el-button type="primary" size="mini" @click.native="maximize">Maximize</el-button>
  </div>
</template>

<script setup lang="ts">
import {onMounted} from "vue";
import {useRouter} from "vue-router";

let router;
onMounted(() => {
  router = useRouter();
});
const maximize = () => {
  window.openAIClient.maximizeWindow();
  router.push('/');
}
</script>

<style scoped>
.minus-container {
  display: block;
  width: 100%;
  height: 100%;
}
</style>