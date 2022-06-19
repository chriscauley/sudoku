import { RestStorage } from '@unrest/vue-storage'

export default () => {
  const collection_slug = 'schema/puzzle'
  const storage = RestStorage('schema/puzzle', { collection_slug })
  return storage
}
