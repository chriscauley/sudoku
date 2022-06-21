<template>
  <table class="table table-striped">
    <thead>
      <tr>
        <th colspan="2">
          Controls:
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, i) in rows" :key="i" :class="row[2]">
        <td>{{ row[0] }}</td>
        <td>
          <parity-link v-if="row[1].parity" :name="row[1].parity" />
          <span v-else>
            {{ row[1] }}
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
const ParityLink = ({ name }) => (
  <div>
    {`Mark ${name.replace('parity:', '')} `}(
    <router-link class="link" to="/help/parity/">
      see parity
    </router-link>
    )
  </div>
)

export default {
  components: { ParityLink },
  setup() {
    return {
      rows: [
        ['0-9', 'Set selected cells to the number'],
        ['ctrl + 0-9', 'Pencil mark centre'],
        ['shift + 0-9', 'Pencil mark corner'],
        ['ctrl + shift + 0-9', 'Set color'],
        ['ctrl + z', 'Undo last move'],
        ['ctrl + y', 'Redo last move'],
        ['delete', 'Clear selected'],
        ['o or q', { parity: 'odd' }],
        ['e or w', { parity: 'even' }],
        ['arrows', 'Move cursor around puzzle'],
        ['ctrl + arrows', 'Select multiple cells'],
        ['click', 'Select square'],
        ['ctrl + click', 'Add/remove cells from selection'],
      ],
    }
  },
}
</script>
