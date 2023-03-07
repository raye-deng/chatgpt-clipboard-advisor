import {createRouter, createWebHashHistory} from 'vue-router';
import Completion from "../views/Completion.vue";
import SetOpenAIKey from "../views/SetOpenAIKey.vue";
import Minus from "../views/Minus.vue";

const routes: any = [
    {path: '', component: async () => Completion},
    {path: '/', component: async () => Completion},
    {path: '/set-api-key', component: async () => SetOpenAIKey},
    {path: '/minus', component: async () => Minus},
]

const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHashHistory(),
    routes, // short for `routes: routes`
})

export {router}