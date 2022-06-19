import React from 'react'
import ReactDOM from 'react-dom'
import classnames from 'classnames'
import { HashRouter, Route } from 'react-router-dom'
import { alert } from '@unrest/core'

import config from './config'
import Nav from './components/Nav'
import game from './game'
import help from './help'
import About from './About'
import './url' // sets root url for @unrest/react-rest-hook and @unrest/core
import AdminTable from './game/AdminTable'

function App() {
  document.body.className = classnames(config.use().formData)
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
        <Route path="/help/" component={help.View} />
        <Route path="/about/" component={About} />
        <Route path="/radmin/" component={AdminTable} />
        <alert.List />
      </div>
    </HashRouter>
  )
}

const domContainer = document.querySelector('#react-app')
ReactDOM.render(<App />, domContainer)
