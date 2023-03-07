<script setup lang="ts">
import {onMounted, ref} from "vue";
import {useRouter} from 'vue-router';

const key = ref('')
let router;
onMounted(()=>{
  router = useRouter();
})
const setKey = () => {
  window.openAIClient.setOpenAIKey(key.value)
  router?.push("/");
}
</script>

<template>
  <div class="set-key-container">
    <el-input v-model="key" placeholder="Input your OpenAI API key"
              style="display: block;width:100%;margin:5px auto;"></el-input>
    <el-button @click.native="setKey" style="display: block;width: 100%;" type="primary">Save</el-button>
  </div>
</template>

<style scoped>
.set-key-container {
  display: block;
  margin-top: 20vh;
  padding: 0 10px;
  text-align: center;
}
</style>