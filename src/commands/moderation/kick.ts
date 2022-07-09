import { Help, Config, IExecuteArgs } from "discord.js"
import { ModActions } from "../../utils"

const configs: Config = {
  permissions: [
    'KICK_MEMBERS'
  ]
}

const help: Help = {
  name: "kick",
  category: "Moderation",
  description: "Kicks the specified user.",
  usage: "kick [@user | userID] (reason)",
  example: [
    'kick @User',
    'kick 1234567890',
    'kick @User Go cool down.',
    'kick 1234567890 Go cool down.'
  ]
}

export class Kick {

  public static async run({
    message,
    args
  }: IExecuteArgs) {

    const { guild, author, channel, member: authorMember } = message
    if (!guild || !authorMember) return

    await message.delete()

    const target = message.mentions.members && message.mentions.members.first() && message.mentions.members.first() || { id: args[0] }
    const reason = args.splice(1).join(' ') || 'No reason provided'

    const member = guild.members.cache.get(target.id)
    if (!member) return message.channel.send(`Unable to find member for arguments: ${args[0]}`)

    await member.fetch()

    if (authorMember.roles.highest.position <= member.roles.highest.position && authorMember.id !== guild.ownerId) return channel.send(`You don't have the required permissions to perform this action!`)
    
    ModActions.kick(member, (channel as any), reason, author)

  }

  public static get help() {
    return help
  }

  public static get configs() {
    return configs
  }

}