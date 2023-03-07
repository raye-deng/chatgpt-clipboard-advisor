<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue'

import {useRouter} from 'vue-router';

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
  qAndA.value.push({q: question.value, a: 'loading...'});
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
</script>

<template>
  <div class="completion-container">
    <el-input
        v-model="question"
        :disabled="loading"
        placeholder="Input your question and get completions."
    >
    </el-input>
    <p>
      <el-button type="success" @click.native="askCompletion" style="display: block;width: 100%" :disabled="loading"
                 :loading="loading">
        Complete
      </el-button>

      <el-button type="primary" @click.native="minus" style="display: block;width: 100%;margin:10px auto 0 auto;">
        Minus
      </el-button>
    </p>
    <div v-if="qAndA.length>0">
      <el-alert
          :key="`q:${item.q}a:${item.a}`"
          v-for="(item, index) in qAndA"
          :title="`q:${item.q}`"
          :type="`${item.a === 'loading...' ? 'info' : 'success'}`"
          :description="`a:${item.a}`"
      />

    </div>
  </div>
</template>

<style scoped>
.completion-container {
  display: block;
  margin-top: 20vh;
}

.input-with-select {
  background-color: var(--el-fill-color-blank);
}

.el-alert {
  margin: 5px auto;
  text-align: left;
}
</style>
