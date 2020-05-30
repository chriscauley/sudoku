const FB_URL =
  'https://firebasestorage.googleapis.com/v0/b/sudoku-sandbox.appspot.com/o/'

export default (slug) =>
  fetch(`${FB_URL}${slug}`)
    .then((r) => r.json())
    .then((data) =>
      fetch(`${FB_URL}${slug}?alt=media&token=${data.downloadTokens}`),
    )
    .then((r) => r.json())
