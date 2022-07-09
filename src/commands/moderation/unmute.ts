import { Help, Config, IExecuteArgs } from 'discord.js'
import { ModLog } from '../../db/models'
import { ModActions } from '../../utils'

const help: Help = {
  name: "unmute",
  category: "Moderation",
  description: "Removes the configured Muted role from specified user and removes the timer on their mute.",
  usage: "unmute [@user | userID]",
  example: [
    'unmute 1234567890',
    'unmute @User'
  ]
}

const configs: Config = {
  permissions: [
    'MUTE_MEMBERS'
  ]
}

export class Unmute {

  public static async run({
    message,
    args
  }: IExecuteArgs) {

    const { guild, channel, member: authorMember } = message
    if (!guild || !authorMember) return

    const target = message.mentions.members && message.mentions.members.first() && message.mentions.members.first() || { id: args[0] }

    const member = guild.members.cache.get(target.id)
    if (!member) return channel.send(`Unable to find member for arguments: ${args[0]}`)

    await member.fetch()

    if (authorMember.roles.highest.position <= member.roles.highest.position && authorMember.id !== guild.ownerId) return channel.send(`You don't have the required permissions to perform this action!`)

    const action = await ModLog.fetchActiveUserMute(guild.id, member.id)
    if (!action) return channel.send(`Unable to find an active mute for that user.`)

    ModActions.unmute(member, action, authorMember.user)

  }

  public static get help() {
    return help
  }

  public static get configs() {
    return configs
  }

}