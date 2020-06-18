import pride from './pride'

export default class Animator {
  constructor(board) {
    this.lastframe = 0
    this.board = board
    this.queue = []
    this.ms_per_frame = 200
    this.ms_per_fade = 700
    this.current_frame_ms = 0
    this.i_color = 0
  }

  init() {
    // expensive setup steps that only need to be done once
    if (this.ctx) {
      return
    }
    const { width, height } = this.board.geo.element.getBoundingClientRect()
    const canvas = (this.canvas = document.createElement('canvas'))
    const _last = document.createElement('canvas')
    const live_canvas = this.board.animation_canvas
    document.body.appendChild(canvas)
    canvas.width = _last.width = live_canvas.width = width
    canvas.height = _last.height = live_canvas.height = height
    this.ctx = canvas.getContext('2d')
    this.live_ctx = live_canvas.getContext('2d')
    if (this._last) {
      _last.drawImage(this._last, 0, 0, width, height)
    }
    this._last = _last
  }

  resize() {
    delete this.ctx()
    this.init()
  }

  nextColor(scheme) {
    return pride[scheme][this.i_color++ % pride[scheme].length]
  }

  add({ indexes, delay = 1, scheme }) {
    if (scheme !== this.last_scheme) {
      this.i_color = 0
      this.last_scheme = scheme
    }
    this.queue.push({ indexes, delay, fillStyle: this.nextColor(scheme) })
    cancelAnimationFrame(this.animationframe)
    this.animationframe = requestAnimationFrame(this.tick)
  }

  tick = () => {
    cancelAnimationFrame(this.animationframe)
    this.init()
    const { width, height } = this.canvas
    const now = new Date().valueOf()
    const delta_ms = now - this.lastframe

    this.ctx.clearRect(0, 0, width, height)
    // this.ctx.globalAlpha = (this.ms_per_fade - delta_ms) / this.ms_per_fade
    this.ctx.drawImage(this._last, 0, 0, width, height)
    this.ctx.globalAlpha = 1
    if (delta_ms > this.current_frame_ms && this.queue.length) {
      const { indexes, fillStyle, delay } = this.queue.shift()
      this.current_frame_ms = this.ms_per_frame * delay
      const s = width / 9
      this.ctx.fillStyle = fillStyle
      indexes.forEach((index) => {
        const xy = this.board.geo.index2xy(index)
        this.ctx.fillRect(xy[0] * s, xy[1] * s, s, s)
      })
      const last_ctx = this._last.getContext('2d')
      last_ctx.clearRect(0, 0, width, height)
      last_ctx.drawImage(this.canvas, 0, 0, width, height)
      this.lastframe = now
    }
    this.live_ctx.clearRect(0, 0, width, height)
    if (now - this.lastframe < this.ms_per_fade || this.queue.length) {
      this.animationframe = requestAnimationFrame(this.tick)
      this.live_ctx.drawImage(this.canvas, 0, 0)
    } else {
      this._last.getContext('2d').clearRect(0, 0, width, height)
      this.current_frame_ms = 0
    }
  }

  animate({ checker, constraints }) {
    const schemes = {
      row: 'diversity',
      col: 'bi',
      box: 'trans',
      complete: 'diversity',
    }
    constraints.map((name) => {
      if (checker.checked[name]) {
        checker.checked[name].forEach((indexes) =>
          this.add({ indexes, scheme: schemes[name] || 'lgbt' }),
        )
      }
    })
  }
}
