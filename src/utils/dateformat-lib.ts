export function format(date: Date) {
    const monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"
    ];

    return `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}\n${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()} UTC`;
}

export const getTimerValue = (datenumber: number) => {

  const now = Date.now()

  const diff = datenumber - now

  if (diff < 0) return 'Now!'

  const days = getDays(diff)
  const hours = getHours(diff) - days * 24
  const minutes = getMinutes(diff) - hours * 60 - days * 24 * 60

  if (days > 0) return `${days}d${hours > 0 ? ` ${hours}h` : minutes > 0 ? ` ${minutes}m` : ''}`
  if (hours > 0) return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`
  if (minutes > 0) return `${minutes}m`
  return '< 1m'

}

const getDays = (time: number) => {
  return Math.floor(time / 1000 / 60 / 60 / 24)
}

const getHours = (time: number) => {
  return Math.floor(time / 1000 / 60 / 60)
}

const getMinutes = (time: number) => {
  return Math.floor(time / 1000 / 60)
}

export function formatDiff(millis: number, includeMillis?: boolean) {
  
  const daysRemainder = millis % (1000 * 60 * 60 * 24)
  const days = (millis - daysRemainder) / (1000 * 60 * 60 * 24)

  const hoursRemainder = daysRemainder % (1000 * 60 * 60)
  const hours = (daysRemainder - hoursRemainder) / (1000 * 60 * 60)

  const minutesRemainder = hoursRemainder % (1000 * 60)
  const minutes = (hoursRemainder - minutesRemainder) / (1000 * 60)

  const secondsRemainder = minutesRemainder % 1000
  const seconds = (minutesRemainder - secondsRemainder) / 1000

  const textArray = [`${days}d`, `${hours}h`, `${minutes}m`, `${seconds}s`]
  if (includeMillis) textArray.push(`${secondsRemainder}ms`)

  return textArray.filter(a => !a.startsWith('0')).join(' ')
}