const color_map = {
  '#A3E048': 'green',
  '#F7D038': 'yellow',
  '#34BBE6': 'blue',
  '#CFCFCF': 'border',
  '#E6261F': 'red',
  '#D23BE7': 'magenta',
  '#EB7532': 'orange',
  '#000000': 'text',
  '#FFFFFF': 'bg',
}

export default (color) => {
  color = color.toUpperCase()
  if (!color_map[color]) {
    console.warn('missing color', color)
    return 'border'
  }
  return color_map[color]
}
