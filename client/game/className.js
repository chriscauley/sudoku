import classnames from 'classnames'

export default ({ xy, dxy, ...extra1 }, extra2) => {
  return classnames(
    xy && `x-${xy[0]} y-${xy[1]}`,
    dxy && `dx-${dxy[0]} dy-${dxy[1]}`,
    extra1,
    extra2,
  )
}
