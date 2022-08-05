import { CanvasRenderingContext2D } from 'canvas'

CanvasRenderingContext2D.prototype.roundedRect = function (this: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  if (width < 2 * radius) radius = width / 2
  if (height < 2 * radius) radius = height / 2
  this.beginPath()
  this.moveTo(x + radius, y)
  this.arcTo(x + width, y, x+ width, y + height, radius)
  this.arcTo(x + width, y + height, x, y + height, radius)
  this.arcTo(x, y + height, x, y, radius)
  this.arcTo(x, y, x + width, y, radius)
  this.closePath()
  return this
}

CanvasRenderingContext2D.prototype.leftRoundedRect = function (this: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  if (width < 2 * radius) radius = width / 2
  if (height < 2 * radius) radius = height / 2
  this.beginPath()
  this.moveTo(x + radius, y)
  this.lineTo(x + width, y)
  this.lineTo(x + width, y + height)
  this.arcTo(x, y + height, x, y, radius)
  this.arcTo(x, y, x + width, y, radius)
  this.closePath()
  return this
}

CanvasRenderingContext2D.prototype.loadingBar = async function (this: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, loadingPercent: number) {
  this.roundedRect(x, y, width, height, radius)
  this.fillStyle = '#000'
  this.fill()

  this.roundedRect(x + 5, y + 5, width - 10, height - 10, radius)
  this.fillStyle = '#555'
  this.fill()

  const barWidth = (width - 10) * loadingPercent

  const gradient = this.createLinearGradient(x, y, x + barWidth, 0)
  gradient.addColorStop(0, 'rgba(0, 255, 255, 1.0')
  gradient.addColorStop(0.5, 'rgba(186, 85, 211, 1.0')

  this.save()
  this.leftRoundedRect(x + 5, y + 5, (width - 10) * loadingPercent, height - 10, radius)
  this.clip()

  this.fillStyle = gradient
  this.fillRect(x + 5, y + 5, barWidth, height)
  this.restore()

  return this
}

export {}