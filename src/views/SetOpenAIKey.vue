<script setup lang="ts">
import {onMounted, ref} from "vue";
import {useRouter} from 'vue-router';
import {Back} from "@element-plus/icons-vue"

const key = ref('')
let router;
onMounted(() => {
  router = useRouter();
})
const setKey = () => {
  window.openAIClient.setOpenAIKey(key.value)
  router?.push("/");
}
</script>

<template>
  <div class="set-key-container">
    <el-button circle :icon="Back"
               style="position: fixed; top: 10px; left: 10px; z-index: 1000;"
               @click.native="router.push('/')">
    </el-button>
    <div>
      <el-input v-model="key" placeholder="Input your OpenAI API key" clearable></el-input>
    </div>
    <el-button @click.native="setKey" style="display: block;width: 100%;margin: 5px auto;" type="primary">Save
    </el-button>
  </div>
</template>

<style scoped>
.set-key-container {
  display: block;
  margin-top: 20vh;
  width: 100%;
  text-align: center;
}
</style>