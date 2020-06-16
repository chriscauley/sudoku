import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter, Route } from 'react-router-dom'
import { alert } from '@unrest/core'

import config from './config'
import Nav from './components/Nav'
import game from './game'

const App = () => {
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
}

const domContainer = document.querySelector('#react-app')
ReactDOM.render(<App />, domContainer)
