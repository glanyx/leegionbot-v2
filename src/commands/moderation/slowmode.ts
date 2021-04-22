import { Help, Config, IExecuteArgs, TextChannel } from "discord.js"
import { logger } from "../../utils"

const help: Help = {
  name: "slowmode",
  category: "Moderation",
  description: "Sets the slowmode for the current channel or a specified channel. Not specifying a time will remove slowmode, so will setting a time of 0 seconds. The maximum slowmode time is 6 hours. Any higher value is automatically reduced to 6 hours.",
  usage: "slowmode (Channel ID) (time[s | m | h])",
  example: [
    'slowmode',
    'slowmode 30s',
    'slowmode 1234567890 2m',
    'slowmode 6h 1234567890',
    'slowmode 1234567890 3h 30m 20s'
  ]
}

const configs: Config = {
  permissions: [
    'MANAGE_MESSAGES'
  ]
}

export class Slowmode {

  public static async run({
    message,
    args
  }: IExecuteArgs) {

    const { guild } = message
    if (!guild) return

    const secondIndex = args.findIndex(arg => arg.match(/^[0-9]*s$/))
    const seconds = secondIndex >= 0 ? parseInt(args.splice(secondIndex, 1)[0].slice(0, -1)) : 0
    const minuteIndex = args.findIndex(arg => arg.match(/^[0-9]*m$/))
    const minutes = minuteIndex >= 0 ? parseInt(args.splice(minuteIndex, 1)[0].slice(0, -1)) : 0
    const hoursIndex = args.findIndex(arg => arg.match(/^[0-9]*h$/))
    const hours = hoursIndex >= 0 ? parseInt(args.splice(hoursIndex, 1)[0].slice(0, -1)) : 0

    const sum = seconds + (minutes * 60) + (hours * 60 * 60)
    // Limit for slowmode is 6h
    const duration = sum > 21600 ? 21600 : sum

    let channel

    if (!args[0]) {
      channel = message.channel
    } else {
      const channelId = args[0]
      channel = guild.channels.cache.get(channelId)
      if (!channel) return message.channel.send('Unable to find a channel by that ID!')
      await channel.fetch()
      
    }

    if (!channel) return
    
    if (channel.type === 'text') {
      logger.info(`Updating slowmode in Guild ID ${guild.id}, Channel ID ${channel.id} to ${duration} seconds`);
      (channel as TextChannel).setRateLimitPerUser(duration)
    } else {
      message.channel.send('Unable to set slowmode on specified channel.').then(m => m.delete({ timeout: 5000 }))
      return
    }

    message.channel.send(duration === 0 ? `Successfully removed slowmode for <#${channel.id}>.` : `Successfully set slowmode for <#${channel.id}> to ${duration} seconds.`)

  }

  public static get help() {
    return help
  }

  public static get configs() {
    return configs
  }

}