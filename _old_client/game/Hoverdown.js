import React from 'react'
import css from '@unrest/css'
import classNames from 'classnames'

export default class Hoverdown extends React.Component {
  state = {}
  timeout = (func) => {
    clearTimeout(this._timeout)
    if (typeof func === 'function') {
      this._timeuout = setTimeout(func, this.props.delay || 0)
    }
  }
  mouseover = () => {
    this.state.className === 'closed' && this.setState({ className: '' })
    !this.state.loaded && this.timeout(() => this.setState({ loaded: true }))
  }
  componentWillUnmount = () => this.timeout()
  mouseout = () => this.timeout()
  pin = () => this.setState({ className: 'pinned' })
  close = () => this.setState({ className: 'closed' })
  getClass = () =>
    classNames('hoverdown', this.props.className, this.state.className)
  render() {
    const { children, content } = this.props
    const loaded = this.state.loaded || this.props.loaded
    const { pinned } = this.state
    return (
      <div
        className={this.getClass()}
        onMouseOver={this.mouseover}
        onMouseOut={this.mouseout}
      >
        {children}
        <div className="hoverdown--target">
          <div className="hoverdown--links">
            <a
              className={css.icon('thumb-tack cursor-pointer', {
                active: pinned,
              })}
              onClick={this.pin}
            />
            <a
              className={css.icon('close cursor-pointer')}
              onClick={this.close}
            />
          </div>
          {loaded ? content : <span>Loading</span>}
        </div>
      </div>
    )
  }
}
