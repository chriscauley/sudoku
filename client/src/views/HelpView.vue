<template>
  <div class="app-view -help">
    <section>
      <h2 class="h2">How to play</h2>
      <p>
        The goal of sudoku is to fill in the grid with each row, column, and box having the numbers
        1-9. Many maps have additional game rules, which can be viewed in the video description or
        spoken aloud in the video (click the "i" icon in the menu for details and a link to the
        video). If the additional rules are programmed into the game, they will appear as icons on
        the home page and as options in the checker. If there's a
        <i class="constraint constraint-other" />
        icon or "other" listed in the checker, that means the game has additional rules that cannot
        be checked by the program.
      </p>
      <p>
        It's recommended that you watch the Cracking the Cryptic video while solving the puzzles
        (until you "get good") as these puzzles are generally quite hard. But the general strategy
        is to pencil mark the corners (shift + 1-9) and center (ctrl + 1-9) and mark the color of
        the cells (ctrl + shift + 1-9) with notes of where numbers can be.
      </p>
    </section>
    <section id="help__parity">
      <h2 class="h2">Parity</h2>
      <p>
        Parity refers to whether a cell is even (2468) or odd (13579) and on many puzzles it's
        useful to track the parity of a cell. In "parity mode" cells are automatically highlighted
        based off the question, answer, or center pencil mark(s). When you press q, w, e, or o the
        center pencil mark of the square(s) is set to 2468 or 13579 accordingly and switch the
        display to parity mode.
      </p>
    </section>
    <section>
      <h2 class="h2">Color mode</h2>
      The game defaults to colour mode, where the background of a cell can be set. If you select
      "parity" cells will be automatically colored based off whether they are even (2468) or odd
      (13579). Setting the colour or parity of a cell will switch the game mode.
    </section>
    <section>
      <KeyTable />
    </section>
  </div>
</template>

<script>
import KeyTable from '@/components/KeyTable'

export default {
  __route: {
    path: '/help/',
  },
  components: { KeyTable },
}
</script>
