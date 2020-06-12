import css from '@unrest/css'

export default (active) => css.button[active ? 'dark' : 'light']('mr-2 block')
