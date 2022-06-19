export default ({ ctrlKey, shiftKey }, _default = 'answer') => {
  if (ctrlKey && shiftKey) {
    return 'colour'
  } else if (ctrlKey) {
    return 'centre'
  } else if (shiftKey) {
    return 'corner'
  }
  return _default
}
