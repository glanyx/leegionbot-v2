import { Help, Config, IExecuteArgs, PermissionFlagsBits } from 'discord.js'
import { ModActions } from '../../utils'

const configs: Config = {
  permissions: [
    PermissionFlagsBits.MuteMembers
  ]
}

const help: Help = {
  name: "mute",
  category: "Moderation",
  description: "Mutes the specified member by attaching a role. Time provided must be in minutes, hours or days (or a combination of these).",
  usage: "mute [@user | userID] [time[m | h | d]] (reason)",
  example: [
    'mute @User 20m',
    'mute 1234567890 2h',
    'mute @User 1d Be quiet for a day.',
    'mute 1234567890 1d 12h 30m Be quiet, you!'
  ]
}

export class Mute {

  public static async run({
    message,
    args
  }: IExecuteArgs) {

    const { guild, channel, author, member: authorMember } = message
    if (!guild || !authorMember) return

    const minuteIndex = args.findIndex(arg => arg.match(/^[0-9]*m$/))
    const minutes = minuteIndex >= 0 ? parseInt(args.splice(minuteIndex, 1)[0].slice(0, -1)) : 0
    const hoursIndex = args.findIndex(arg => arg.match(/^[0-9]*h$/))
    const hours = hoursIndex >= 0 ? parseInt(args.splice(hoursIndex, 1)[0].slice(0, -1)) : 0
    const daysIndex = args.findIndex(arg => arg.match(/^[0-9]*d$/))
    const days = daysIndex >= 0 ? parseInt(args.splice(daysIndex, 1)[0].slice(0, -1)) : 0
    const sum = (minutes * 60 * 1000) + (hours * 60 * 60 * 1000) + (days * 24 * 60 * 60 * 1000)

    if (!minutes && !hours && !days) return (channel as any).send('Please specify a duration for this mute!')

    if (!args[0]) return (channel as any).send('Please specify a user to mute!')

    const target = message.mentions.members && message.mentions.members.first() && message.mentions.members.first() || { id: args[0] }
    const reason = args.splice(1).join(' ') || 'No reason provided'

    const member = guild.members.cache.get(target.id)
    if (!member) return (message.channel as any).send(`Unable to find member for arguments: ${args[0]}`)

    await member.fetch()

    if (authorMember.roles.highest.position <= member.roles.highest.position && authorMember.id !== guild.ownerId) return (channel as any).send(`You don't have the required permissions to perform this action!`)

    ModActions.mute(member, reason, author, sum, false, (channel as any))

  }

  public static get help() {
    return help
  }

  public static get configs() {
    return configs
  }

}