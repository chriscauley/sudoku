import unrest from '@unrest/vue'

import config from './config'
import play from './play'
import puzzle from './puzzle'
import ui from './ui'

export default unrest.Store({
  config,
  play,
  puzzle,
  ui,
})
