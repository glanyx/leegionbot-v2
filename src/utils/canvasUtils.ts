export const roundedRect = (ctx: any, x: number, y: number, width: number, height: number, radius: number) => {
  if (width < 2 * radius) radius = width / 2
  if (height < 2 * radius) radius = height / 2
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + width, y, radius)
  ctx.closePath()
  return ctx
}

export const leftRoundedRect = (ctx: any, x: number, y: number, width: number, height: number, radius: number) => {
  if (width < 2 * radius) radius = width / 2
  if (height < 2 * radius) radius = height / 2
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width, y)
  ctx.lineTo(x + width, y + height)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + width, y, radius)
  ctx.closePath()
  return ctx
}

export const loadingBar = (ctx: any, x: number, y: number, width: number, height: number, radius: number, loadingPercent: number) => {
  roundedRect(ctx, x, y, width, height, radius)
  ctx.fillStyle = '#000'
  ctx.fill()

  roundedRect(ctx, x + 5, y + 5, width - 10, height - 10, radius)
  ctx.fillStyle = '#555'
  ctx.fill()

  const barWidth = (width - 10) * loadingPercent

  const gradient = ctx.createLinearGradient(x, y, x + barWidth, 0)
  gradient.addColorStop(0, 'rgba(0, 255, 255, 1.0')
  gradient.addColorStop(0.5, 'rgba(186, 85, 211, 1.0')

  ctx.save()
  leftRoundedRect(ctx, x + 5, y + 5, (width - 10) * loadingPercent, height - 10, radius)
  ctx.clip()

  ctx.fillStyle = gradient
  ctx.fillRect(x + 5, y + 5, barWidth, height)
  ctx.restore()

  return ctx
}