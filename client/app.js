import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter, Route } from 'react-router-dom'

import Nav from './components/Nav'
import game from './game'

const App = () => {
  return (
    <HashRouter>
      <Nav />
      <div className="app-content">
        <Route exact path="/" component={game.Index} />
        <Route exact path="/ctc/" component={game.Index} />
        <Route exact path="/ctc/:slug" component={game.CTC} />
      </div>
    </HashRouter>
  )
}

const domContainer = document.querySelector('#react-app')
ReactDOM.render(<App />, domContainer)
