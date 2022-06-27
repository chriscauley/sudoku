<template>
  <span
    v-for="icon in icons"
    :key="icon"
    :class="`constraint constraint-${icon}`"
    :data-count="getConstraintCount(icon)"
    :title="getTitle(icon)"
  />
  <span
    v-if="counts.unknown > 0"
    :title="`${counts.unknown} other constraints`"
    class="other_constraint"
  >
    {{ counts.unknown === 1 ? '?' : '??' }}
  </span>
</template>

<script>
const icon_constraints = [
  'anti_knight',
  'anti_queen',
  'anti_king',
  'sudoku',
  'thermo',
  'sandwich',
  'arrow_sudoku',
  'other',
]

const groups = {
  sudoku: ['row', 'col', 'box', 'complete'],
  killer: ['killer_sudoku', 'killer_total'],
}

const group_keys = Object.keys(groups)

export default {
  props: {
    meta: Object,
    flag_icon: String,
    constraints: Array,
  },
  computed: {
    icons() {
      const icons = [
        ...group_keys.filter((key) => this.counts[key] >= groups[key].length),
        ...this.constraints.filter((c) => icon_constraints.includes(c)),
      ]
      if (this.flag_icon) {
        icons.push(this.flag_icon)
      }
      return icons
    },
    counts() {
      const counts = {}
      this.constraints.forEach((slug) => {
        const group = group_keys.find((key) => groups[key].includes(slug)) || 'unknown'
        counts[group] = (counts[group] || 0) + 1
      })
      return counts
    },
  },
  methods: {
    getConstraintCount(slug) {
      const slug2meta = {
        sudoku: 'givens',
        killer: 'cages',
        thermo: 'marks',
      }
      return this.meta[slug2meta[slug]]
    },
    getTitle(slug) {
      const counts = this.getConstraintCount(slug)
      if (slug === 'sudoku') {
        const title = this.constraints.length === 1 ? 'Classic' : ''
        return `${title} Sudoku with ${counts} givens.`
      } else if (slug === 'killer') {
        return `Killer sudoku with ${counts} cages.`
      } else if (slug === 'thermo') {
        return 'Thermo sudoku with ${counts} thermometer cells.'
      }

      // slug should be "other"
      return 'Experimental puzzle with custom rules.'
    },
  },
}
</script>
