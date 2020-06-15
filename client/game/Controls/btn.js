import css from '@unrest/css'

export default (active, extra) =>
  css.button[active ? 'dark' : 'light']('mr-2 block', extra)
