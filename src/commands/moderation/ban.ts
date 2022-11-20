import { Help, Config, IExecuteArgs, PermissionFlagsBits } from "discord.js"
import { ModActions } from "../../utils"

const configs: Config = {
  permissions: [
    PermissionFlagsBits.BanMembers
  ]
}

const help: Help = {
  name: "ban",
  category: "Moderation",
  description: "Bans the specified user.",
  usage: "ban [@user | userID] (reason)",
  example: [
    'ban @User',
    'ban 1234567890',
    'ban @User Breaking server rules.',
    'ban 1234567890 Breaking server rules.'
  ]
}

export class Ban {

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
    if (!member) return (message.channel as any).send(`Unable to find member for arguments: ${args[0]}`)

    await member.fetch()

    if (authorMember.roles.highest.position <= member.roles.highest.position && authorMember.id !== guild.ownerId) return (channel as any).send(`You don't have the required permissions to perform this action!`)

    ModActions.ban(member, (channel as any), reason, author)

  }

  public static get help() {
    return help
  }

  public static get configs() {
    return configs
  }

}