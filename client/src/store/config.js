import { ReactiveLocalStorage } from '@unrest/vue-storage'

export default () => {
  const initial = {
    dark_mode: true,
    display_cells: true,
    display_boxes: true,
    heavy_cage: false,
  }

  const schema = {
    type: 'object',
    properties: {
      dark_mode: {
        title: 'Dark Mode',
        type: 'boolean',
      },
      display_cells: {
        title: 'Cell Dividers',
        type: 'boolean',
      },
      display_boxes: {
        title: 'Box Dividers',
        type: 'boolean',
      },
      heavy_cage: {
        title: 'Thick Cages (Killer Sudoku)',
        type: 'boolean',
      },
      cage_last: {
        title: 'Bottom Label (Killer Sudoku)',
        type: 'boolean',
      },
    },
  }

  const storage = ReactiveLocalStorage({ LS_KEY: 'SUDOKU_CONFIG', initial })
  storage.schema = schema

  storage.onChange = () => {
    Object.entries(storage.state).forEach(([key, value]) => {
      const cls = `-${key}`
      const action = value ? 'add' : 'remove'
      document.body.classList[action](cls)
    })
  }

  storage.init = storage.onChange
  return storage
}
