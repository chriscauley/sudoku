<template>
  <div class="flex-cell flex-grow">
    <div class="game-area" ref="game" :style="style">
      <div class="board" :style="boardStyle">
        <div v-for="g in board.gutters" :class="g.class" :key="g.g">
          <span v-for="(v, i) in g.values" :key="i">{{ v }}</span>
        </div>
        <div class="sudoku cage-last display-boxes display-cells">
          <div class="_canvas" :style="{ backgroundImage: board.bg_image }" />
          <canvas ref="animation" class="animation_canvas" />
          <div v-for="cell in cells" :key="cell.index" :class="getClassName(cell)">
            <template v-if="cell.question ?? cell.answer === undefined">
              <div class="corner">{{ cell.corner.join('') }}</div>
              <div class="centre">{{ cell.centre.join('') }}</div>
            </template>
            <span v-if="cell.question !== undefined" class="question number">
              {{ cell.question }}
            </span>
            <span v-else class="answer number">{{ cell.answer }}</span>
            <span v-if="cell.cage" :class="cell.cage.className" :data-text="cell.cage.text" />
            <span v-for="(extra, i) in cell.extras" :key="i" :class="extra.className" />
          </div>
        </div>
        <div class="clickmask" @mousemove="mousemove" ref="clickmask" />
      </div>
    </div>
  </div>
</template>

<script>
import { debounce } from 'lodash'

const listeners = ['keydown', 'mousedown', 'mouseup', 'paste']

export default {
  __route: {
    path: '/puzzle/ctc/:puzzle_id/',
  },
  data() {
    return {
      cellSize: 24,
      hash: 0,
    }
  },
  computed: {
    board() {
      return this.$store.play.board
    },
    style() {
      return { fontSize: `${this.cellSize}px`, padding: `${this.cellSize}px` }
    },
    boardStyle() {
      const size = `${this.cellSize * 9}px`
      return { height: size, width: size, opacity: this.$el ? 1 : 0 }
    },
    cells() {
      this.$store.ui.watch() // forces a re-reneder when ui.state.hash changes
      return this.board.toCells(this.$store.ui.state.selected)
    },
  },
  mounted() {
    this.resize()
    window.addEventListener('resize', this.resize)
    listeners.forEach((s) => document.addEventListener(s, this[s]))
    this.board.bind(this)
  },
  unmounted() {
    window.removeEventListener('resize', this.resize)
    listeners.forEach((s) => document.removeEventListener(s, this[s]))
    this.$store.play.unmount()
  },
  methods: {
    resize: debounce(function () {
      const { offsetHeight, offsetWidth } = this.$refs.game
      this.cellSize = Math.min(offsetWidth, offsetHeight) / 11
    }, 100),
    getClassName(cell) {
      const [x, y] = cell.xy
      const { error, hover, selected } = cell
      return [
        `cell x-${x} y-${y}`,
        cell.selectedNeighbors,
        {
          error,
          hover,
          selected,
          answer: cell.answer !== undefined,
          darkbg: this.$c.dark_colors.includes(cell.colour),
        },
      ]
    },
    paste(_e) {
      console.warn('todo!')
      // for (let i = 0; i < e.clipboardData.items.length; i++) {
      //   const item = e.clipboardData.items[i]
      //   if (!item.type.includes('image')) {
      //     console.warn('Discarding non-image paste data')
      //     continue
      //   }
      //   const screenshot = item.getAsFile()
      //   return postForm(
      //     `/api/schema/PuzzleDataForm/${this.props.api.puzzle.id}/`,
      //     { screenshot },
      //   )
      // }
    },

    setParity(value) {
      const indexes = Object.keys(this.$store.ui.selected)
      this.board.doAction({ value, mode: 'parity', indexes })
    },

    keydown(e) {
      // TODO mousetrap
      const value = this.$c.keyboard.key_map[e.key] || e.key
      if (this.$c.keyboard.allowed_keys.includes(value)) {
        e.preventDefault()
      }
      if (value === 'z' && e.ctrlKey) {
        this.board.undo()
        return
      }
      if (value === 'y' && e.ctrlKey) {
        this.board.redo()
        return
      }
      if (value === 'q' || value === 'o') {
        this.setParity('odd')
        return
      }
      if (value === 'w' || value === 'e') {
        this.setParity('even')
        return
      }
      if (this.$c.keyboard.arrows.includes(value)) {
        return this.sendArrow(value, e.ctrlKey)
      }
      this.sendKey(value, this.$store.ui.getMode())
    },
    sendArrow(value, ctrlKey) {
      const { ui } = this.$store
      if (ui.state.cursor === undefined) {
        return
      }
      const direction = value.toLowerCase().replace('arrow', '')
      const cursor = this.board.geo.moveByText(ui.state.cursor, direction)
      const selected = ctrlKey ? ui.state.selected : {}
      selected[cursor] = true
      this.$store.ui.save({ selected, cursor, hover: null })
    },

    sendKey(value, mode) {
      const { selected } = this.$store.ui.state
      const indexes = Object.keys(selected)
      if (value === 'Delete' || value === 'Backspace') {
        mode = 'delete'
      } else if (!this.$c.keyboard.allowed_keys.includes(value)) {
        return
      }
      this.board.doAction({ mode, indexes, value })
    },

    mousemove(e) {
      this._move([e.clientX, e.clientY])
    },

    mouseup() {
      this.$store.ui.save({ dragging: false, removing: false })
    },

    mousedown(e) {
      if (e.button === 2) {
        // right mouse button
        return
      }
      const index = this.board.geo.pxy2index([e.clientX, e.clientY], this.$refs.clickmask)
      if (e.target.closest('.controls')) {
        return
      }
      let { selected } = this.$store.ui.state
      let removing = selected[index]
      if (e.ctrlKey) {
        if (removing) {
          delete selected[index]
        } else {
          selected[index] = true
        }
      } else {
        selected = { [index]: true }
        removing = false
      }
      this.$store.ui.save({ dragging: true, removing, selected, cursor: index })
    },

    _move(pxy) {
      const hover = this.board.geo.pxy2index(pxy, this.$refs.clickmask)
      const { selected, dragging, removing, hover: old_hover } = this.$store.ui.state
      const old_selected = selected[hover]
      if (dragging) {
        if (removing) {
          delete selected[hover]
        } else {
          selected[hover] = true
        }
      }
      if (old_hover !== hover || old_selected !== selected[hover]) {
        this.$store.ui.save({ hover, selected })
      }
    },
  },
}
</script>
