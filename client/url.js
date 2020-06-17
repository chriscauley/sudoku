import { config as ur_config } from '@unrest/core'
import { settings as rest_settings } from '@unrest/react-rest-hook'

const { SUDOKU_URL = 'https://sudoku.unrest.io' } = process.env
rest_settings.root_url = ur_config.base_url = SUDOKU_URL

const url = (s) => SUDOKU_URL + s
url.ROOT = SUDOKU_URL

export default url
