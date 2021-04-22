import { Client, VoiceChannel } from 'discord.js'
import { Countdown } from '../db/models'
import logger from './logger'
import { getTimerValue } from './dateformat-lib'

const TIMEOUT = 5000

export class Timer {

  timer: NodeJS.Timeout

  constructor(interval: number, func: () => any) {
    this.timer = setInterval(func, interval)
  }

}

interface IChannelCountdown {
  countdown: Countdown
  lastUpdated?: number
}

const CountdownMapper = new Map<string, IChannelCountdown>()

export class CountdownTimer extends Timer {

  constructor(client: Client) {
  
    super(TIMEOUT, () => {

      const now = Date.now()

      CountdownMapper.forEach(async entry => {

        const { id, guildId, channelId, name, time } = entry.countdown

        const guild = client.guilds.cache.get(guildId)
        if (!guild) return
        const channel = guild.channels.cache.get(channelId)
        if (channel) {
          if (time.getTime() - now < 0) {
            (channel as VoiceChannel).edit({
              name: `${name} - Now!`
            })
          } else {
            if (!entry.lastUpdated || now - entry.lastUpdated > 300000) {
              logger.debug(`Updating ChannelTimer Channel ID ${channel.id} on Guild ${guild.id}`);
              try {
                (channel as VoiceChannel).edit({
                  name: `${name} - ${getTimerValue(time.getTime())}`
                })
                entry.lastUpdated = now
              } catch (e) {
                logger.error('Unable to update ChannelTimer', e)
              }
            }
            return
          }
        }
        logger.debug(`Deactivating ChannelTimer Channel ID ${channelId} on Guild ${guildId} | Finished or no longer available.`)
        CountdownMapper.delete(channelId);
        Countdown.fetchById(id).then(ctd => {
          if (!ctd) return
          ctd.deactivate().update()
        })
      })
    })

  }

  public static add(data: IChannelCountdown) {
    CountdownMapper.set(data.countdown.channelId, data)
  }

}
