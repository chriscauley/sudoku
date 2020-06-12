import css from '@unrest/css'

export default {
  ...css,
  btn: (active) => css.button[active ? 'dark' : 'light']('mr-2 block'),
  row: 'flex mb-1 flex-wrap',
}
