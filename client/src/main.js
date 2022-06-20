import { createApp } from 'vue'
import unrest from '@unrest/vue'
import auth from '@unrest/vue-auth'
import form from '@unrest/vue-form'
import css from '@unrest/css'

import App from '@/App.vue'
import constants from '@/constants'
import router from '@/router'
import store from '@/store'

import '@unrest/tailwind/dist.css'
import '@/css/index.css'

css.abtn = (active) => css.button[active ? 'dark' : 'light']('block')

const todo = {
  install(app) {
    app.config.globalProperties.$todo = (text) => {
      throw 'TODO: ' + text
    }
  }
}

createApp(App)
  .use(constants)
  .use(css)
  .use(unrest.plugin)
  .use(unrest.ui)
  .use(auth.plugin)
  .use(form)
  .use(store)
  .use(router)
  .use(todo)
  .mount('#app')
