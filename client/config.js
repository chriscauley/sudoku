import React from 'react'
import css from '@unrest/css'
import ConfigHook from '@unrest/react-config-hook'

const schema = {
  type: 'object',
  title: 'Config',
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
      title: 'Thick killer cages',
      type: 'boolean',
    },
    cage_last: {
      title: 'Bottom-right cage label',
      type: 'boolean',
    },
  },
}

const initial = {
  formData: {
    dark_mode: false,
    display_cells: true,
    display_boxes: true,
    heavy_cage: false,
  }
}

const actions = {
  open: (store) => store.setState({ open: true }),
  close: (store) => store.setState({ open: false }),
}

const config = ConfigHook('site_config', { schema, actions, initial })

config.use = config.useConfig
config.Hoverdown = function Hoverdown(props) {
  return (
    <div className="hoverdown">
      <i className={css.icon('gear')} />
      <div className="hoverdown--target">
        <config.Form autosubmit={true} customButton={true} />
      </div>
    </div>
  )
}

export default config
