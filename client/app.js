import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter, Route } from 'react-router-dom'
import { alert, config as ur_config } from '@unrest/core'
import { settings as rest_settings } from '@unrest/react-rest-hook'

import config from './config'
import Nav from './components/Nav'
import game from './game'
import classnames from 'classnames'

const { SUDOKU_URL = 'https://sudoku.unrest.io' } = process.env
rest_settings.root_url = ur_config.base_url = SUDOKU_URL

const App = config.connect((props) => {
  document.body.className = classnames(props.config.formData)
  return (
    <HashRouter>
      <Nav />
      <div className="app-content">
        <Route
          exact
          path="/new/"
          render={(props) => <game.CTC {...props} slug={'new'} />}
        />
        <Route exact path="/" component={game.Index} />
        <Route exact path="/puzzle/:source/:slug/" component={game.CTC} />
        <config.Form />
        <alert.List />
      </div>
    </HashRouter>
  )
})

const domContainer = document.querySelector('#react-app')
ReactDOM.render(<App />, domContainer)
