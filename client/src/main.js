import { createApp } from 'vue'
import unrest from '@unrest/vue'
import auth from '@unrest/vue-auth'
import form from '@unrest/vue-form'

import router from '@/router'
import store from '@/store'
import App from './App.vue'

import '@unrest/tailwind/dist.css'
import '@/css/index.css'

createApp(App)
  .use(unrest.plugin)
  .use(unrest.ui)
  .use(auth.plugin)
  .use(form)
  .use(store)
  .use(router)
  .mount('#app')
