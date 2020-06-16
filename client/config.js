import React from 'react'
import { alert } from '@unrest/core'
import css from '@unrest/css'
import ConfigHook from '@unrest/react-config-hook'

// const colors = [
//   'text',
//   'border',
//   'bg',
//   'green',
//   'magenta',
//   'pink',
//   'red',
//   'yellow',
//   'teal',
//   'blue',
// ]

const schema = {
  type: 'object',
  title: 'Application Settings',
  properties: {
    dark_mode: {
      title: 'Dark Mode',
      type: 'boolean',
    },
    display_cells: {
      title: 'Cell dividers',
      type: 'boolean',
    },
    display_boxes: {
      title: 'Box dividers',
      type: 'boolean',
    },
    heavy_cage: {
      title: 'Thick cages',
      type: 'boolean',
    },
  },
}

const initial = {
  dark_mode: false,
  display_cells: true,
  display_boxes: true,
  heavy_cage: false,
}

const actions = {
  open: (store) => store.setState({ open: true }),
  close: (store) => store.setState({ open: false }),
}

const connect = ConfigHook('site_config', { schema, actions, initial })

export const ConfigLink = connect(function ConfigLink(props) {
  const { open } = props.config.actions
  return <i className={css.icon('gear mx-2 cursor-pointer')} onClick={open} />
})

function BaseConfigForm(props) {
  if (!props.config.open) {
    return null
  }
  const onSuccess = () => {
    props.alert.success('Config saved')
    props.config.actions.close()
  }
  return (
    <div className={css.modal.outer()}>
      <div className={css.modal.mask()} onClick={props.config.actions.close} />
      <div className={css.modal.content()}>
        <props.config.Form onSuccess={onSuccess} />
      </div>
    </div>
  )
}

export default {
  connect,
  Form: connect(alert.connect(BaseConfigForm)),
}
