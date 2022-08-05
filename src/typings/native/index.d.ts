declare global {
  interface Date {
    addTime(time: number): Date
    getOffsetTime(): number
  }
  interface String {
    capitalize(): string
    toCamelCase(): string
  }
  interface CanvasRenderingContext2D {
    roundedRect(x: number, y: number, width: number, height: number, radius: number): CanvasRenderingContext2D 
    leftRoundedRect(x: number, y: number, width: number, height: number, radius: number): CanvasRenderingContext2D 
    loadingBar(x: number, y: number, width: number, height: number, radius: number, loadingPercent: number): Promise<CanvasRenderingContext2D>
  }
}

export {}