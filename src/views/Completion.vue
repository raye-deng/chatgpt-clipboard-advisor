<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue'

import {useRouter} from 'vue-router';
import {Promotion, Setting} from "@element-plus/icons-vue";

let router;
onMounted(() => {
  router = useRouter();

  // set qAndA from localStorage
  const qAndAFromLocalStorage = localStorage.getItem('qAndA');
  if (qAndAFromLocalStorage) {
    qAndA.value = JSON.parse(qAndAFromLocalStorage);
  }
})
window.openAIClient.checkOpenAIKey((result: boolean) => {
  if (result) {
    useRouter().push('/set-api-key')
  } else {
    window.openAIClient.initOpenAIClient();
  }
})


const msg = ref('show me an example of electron net module.')
const question = ref('')
const qAndA: any = ref([]);
let loading: boolean = false;

const askCompletion = async () => {
  loading = true;
  qAndA.value.push(0, 0, {q: question.value, a: 'loading...'});
  await window.openAIClient.complete(question.value, (answer: string) => {
    msg.value = answer;
    console.log(`answer get in vue: ${msg.value}`);
    qAndA.value.filter((item: any) => item.q === question.value)[0].a = msg.value;
    loading = false;
  });
}

const minus = () => {
  window.openAIClient.minusWindow();
  router.push("/minus")
}

// 在页面回收时将qAndA中的数据写入到本地的localStorage中
onBeforeUnmount(() => {
  localStorage.setItem('qAndA', JSON.stringify(qAndA.value));
})

const goSetting = async () => {
  await router.push("/set-api-key");
};
</script>

<template>
  <div class="completion-container">
    <el-button circle :icon="Setting"
               style="position: fixed; top: 10px; left: 10px; z-index: 1000;"
               @click.native="goSetting">
    </el-button>
    <div class="input-container">
      <el-input
          v-model="question"
          :disabled="loading"
          placeholder="Input your question and get completions."
          @keyup.enter="askCompletion"
      >
        <template #append>
          <el-button type="success" :icon="Promotion" @click.native="askCompletion" :disabled="loading"
                     :loading="loading">
          </el-button>
        </template>
      </el-input>
    </div>

    <div v-if="qAndA.length>0">
      <div :key="`q:${item.q}a:${item.a}`" class="q-a-item"
           v-for="(item, index) in qAndA.value">
        <div class="q">
          <span class="content">{{ item.q }}</span>
          <el-tag>:you</el-tag>
        </div>

        <div class="a">
          <el-tag type="success">assistant</el-tag>
          <span class="content">{{ item.a }}</span>
        </div>

      </div>
    </div>
    <div v-else style="text-align:left">
      <el-skeleton :rows="1" style="margin-top:10px;"/>
      <el-skeleton :rows="2" style="margin-top:10px;"/>
      <el-skeleton :rows="1" style="margin-top:10px;"/>
    </div>
  </div>
</template>

<style scoped>
.completion-container {
  display: block;
  padding-top: 20px;
}

.input-container {
  position: fixed;
  bottom: 10px;
  display: block;
  left: 0;
  width: calc(100% - 20px);
  padding: 0 10px;
}

.q-a-item {
  margin: 5px auto;
  text-align: left;
  border-radius: 3px;
  border-bottom: 1px solid #ddd;
}

.q-a-item div {
  margin: 5px 0;
}

.q-a-item div.q {
  display: block;
  text-align: right;
}

.q-a-item div span.content {
  text-indent: 2px;
  display: inline-block;
  margin: auto 5px;
  vertical-align: baseline;
  font-size: 14px;

}

.input-with-select {
  background-color: var(--el-fill-color-blank);
}

.el-alert {
  margin: 5px auto;
  text-align: left;
}
</style>
