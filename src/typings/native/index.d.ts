declare global {
  interface Date {
    addTime(time: number): Date
    getOffsetTime(): number
  }
  interface String {
    capitalize(): string
    toCamelCase(): string
  }
}

export {}