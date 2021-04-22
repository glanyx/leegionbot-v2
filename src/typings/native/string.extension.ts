String.prototype.toCamelCase = function (this: string) {
  return this.replace(/(?:^\w|[A-Z]|\b\w)/g, (subSection, index) => {
    return index === 0 ? subSection.toLowerCase() : subSection.toUpperCase()
  }).replace(/\s+/g, '')
}

String.prototype.capitalize = function (this: string) {
  return this.substr(0, 1).toUpperCase() + this.substr(1)
}

export {}