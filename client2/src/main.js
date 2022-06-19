import { createApp } from 'vue'
import App from './App.vue'
import unrest from '@unrest/vue'

createApp(App)
  .use(unrest)
  .use(unrest.ui)
  .mount('#app')
