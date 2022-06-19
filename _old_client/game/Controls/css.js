import css from '@unrest/css'

export default {
  ...css,
  btn: (active) => css.button[active ? 'dark' : 'light']('block'),
}
