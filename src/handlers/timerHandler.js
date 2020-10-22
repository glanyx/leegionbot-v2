import { client } from '../index'
import uuid from 'uuid'
import * as dynamoDbLib from '../libs/dynamodb-lib'

const timerMap = new Map();

export class Timer {

  /**
   * @param {string} name
   * @param {string} guildId
   * @param {string} channelId
   * @param {Date} date
   */
  constructor(name, guildId, channelId, date) {
    this.name = name
    this.guildId = guildId
    this.channelId = channelId
    this.date = date.getTime()
  }

  async create () {
    const params = { 
      TableName: 'leegionbot-timers',
      Item: {
        timerId: uuid.v1(),
        ...this,
      }
    }

    try {
      await dynamoDbLib.call('put', params);
    } catch (e) {
      console.log(e);
      new Error(
        `Oops, it seems I can't store your data right now. Please try again in a minute or contact my owner!`
      );
    }

    return this
  }

  start() {
    const guild = client.guilds.cache.get(this.guildId)
    const channel = guild.channels.cache.has(this.channelId) ? guild.channels.cache.get(this.channelId) : null

    if (!channel) return

    let count = 0
    let lastUpdated = 0

    this.timer = setInterval(async () => {
      count++

      if (channel.deleted) {
        clearInterval(this.timer)
        return
      }

      if (lastUpdated === 0 || count - 300 >= lastUpdated || this.date - Date.now() < 0){
        lastUpdated = count

        const timerData = getTimerValue(this.date)

        if (timerData === 'Done!') {
          clearInterval(this.timer)
        }

        if (`${this.name} - ${timerData}` !== channel.name) {
          await channel.edit({
            name: `${this.name} - ${timerData}`
          })
        }
      }
    }, 1000)
  }

}

/**
 * 
 * @param {Date} date
 * @returns {String}
 */
export const getTimerValue = (date) => {

  const now = Date.now()

  const diff = date - now

  if (diff < 0) return 'Done!'

  const days = Math.floor(diff / 1000 / 60 / 60 / 24)

  if (days >= 1) return `${days} ${days === 1 ? 'Day' : 'Days'}`

  const hours = Math.floor(diff / 1000 / 60 / 60)

  if (hours >= 1) return `${hours} ${hours === 1 ? 'Hour' : 'Hours'}`

  const minutes = Math.floor(diff / 1000 / 60)

  if (minutes >= 1) return `${minutes} ${minutes === 1 ? 'Minute' : 'Minutes'}`

  return '< 1 Minute'

}

export const loadAllTimers = async () => {
  const params = {
    TableName: 'leegionbot-timers'
  }

  try {
    const { Items } = await dynamoDbLib.call('scan', params);

    if (Items) {
      Items.forEach(item => {
        new Timer(item.name, item.guildId, item.channelId, new Date(item.date)).start()
      })
    }

  } catch (e) {
    console.log(e);
    new Error(
      `Unable to fetch all timers!`
    );
  }
}