Date.prototype.addTime = function (this: Date, time: number) {
  const date = new Date(this.valueOf())
  date.setTime(date.getTime() + time)
  return date
}

Date.prototype.getOffsetTime = function (this: Date) {
  return this.getTime() + (this.getTimezoneOffset() * -1 * 60 * 1000)
}

export {}