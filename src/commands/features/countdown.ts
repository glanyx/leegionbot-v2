import { Help, Config, IExecuteArgs } from "discord.js"
import { GuildSetting, Countdown as CountdownModel } from '../../db/models'
import { getTimerValue, CountdownTimer } from '../../utils'

const configs: Config = {
  permissions: [
    'MANAGE_CHANNELS'
  ]
}

const help: Help = {
  name: "countdown",
  category: "Features",
  description: "Creates a voice channel that updates a timer on a 5 minute interval. Arguments can be specified in any order. At least a date OR a time must be provided.",
  usage: "countdown [dd/mm(/yy(yy))] [hh:mm(:ss)] (name)",
  example: [
    'countdown 25/12',
    'countdown 25/12 Christmas!',
    'countdown 25/12/2021 Christmas!',
    'countdown 12:00 Midday',
    'countdown 10/03 12:00 Tomorrow Midday'
  ]
}

const alias = ['cntdwn', 'ct']

export class Countdown {

  public static async run({
    message,
    args
  }: IExecuteArgs) {

    const today = new Date()

    const { guild, channel } = message
    if (!guild) return

    const dateIndex = args.findIndex(item => item.includes('/'))
    const date = dateIndex >= 0 ? args.splice(dateIndex, 1)[0] : `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`
    
    const timeIndex = args.findIndex(item => item.includes(':'))
    const time = timeIndex >= 0 ? args.splice(timeIndex, 1)[0] : '00:00'

    const dateArgs = date.split('/').map(item => parseInt(item))
    const timeArgs = time.split(':').map(item => parseInt(item))

    const name = args.join(' ')
    const target = new Date(dateArgs[2] || today.getFullYear(), dateArgs[1] - 1, dateArgs[0], timeArgs[0], timeArgs[1], timeArgs[2] || 0)

    const everyoneRole = guild.roles.everyone

    const createdChannel = await guild.channels.create(`${name} - ${getTimerValue(target.getTime())}`, {
      type: 'GUILD_VOICE',
      permissionOverwrites: [
        {
          id: everyoneRole.id,
          allow: ['VIEW_CHANNEL'],
          deny: ['CONNECT']
        }
      ]
    })

    CountdownModel.storeNewTimer({
      guildId: guild.id,
      channelId: createdChannel.id,
      time: target,
      name: name,
    }).then(countdown => {
      
      CountdownTimer.add({
        countdown,
        lastUpdated: today.getTime()
      })

      channel.send('Created!')

    })

  }

  public static get help() {
    return help
  }

  public static get configs() {
    return configs
  }

  public static get alias() {
    return alias
  }
}