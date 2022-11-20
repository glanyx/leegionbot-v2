import { Help, Config, IExecuteArgs, GuildMember, TextChannel, User, PermissionFlagsBits } from "discord.js"
import { ModLog } from '../../db/models'
import { logger, OldPaginator } from '../../utils'

const configs: Config = {
  permissions: [
    PermissionFlagsBits.ManageMessages
  ]
}

const help: Help = {
  name: "modlog",
  category: "Moderation",
  description: "Displays moderator actions for a specified user.",
  usage: 'modlog [@user | userID]',
  example: [
    'modlog @User',
    'modlog 1234567890'
  ]
}

const alias = ['mlog']

export class Modlog {

  public static async run({
    message,
    args
  }: IExecuteArgs) {

    const { guild, channel, author } = message
    if (!guild) return

    if (!args[0]) {
      (channel as any).send('Please specify a user to search logs for!')
      return
    }

    args.forEach(async arg => {
      let foundMember
      if (arg.match(/^<@[0-9]*>$/g)) {
        foundMember = guild.members.cache.get(arg.substring(2, arg.length - 1))
      } else if (arg.match(/^<@![0-9]*>$/g)) {
        foundMember = guild.members.cache.get(arg.substring(3, arg.length - 1))
      } else {
        foundMember = await guild.members.fetch(arg).catch(() => {
          logger.debug(`Unable to find member for arguments ${arg} in Guild ID ${guild.id}`)
        })
      }
      if (!foundMember) return (channel as any).send(`Unable to find member for arguments ${arg}`)
      sendPaginator(foundMember, (channel as TextChannel), author)
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

const sendPaginator = async (member: GuildMember, channel: TextChannel, author: User) => {

  const { guild } = member

  const { items: logs } = await ModLog.fetchByUserId(guild.id, member.id)

  if (logs.length === 0) return channel.send(`No logs found for User <@${member.id}>`)

  new OldPaginator({
    channel: channel,
    author: author,
    items: await Promise.all(logs.map(async item => `**Action:** ${item.action}\n**Actioned by:** ${(await guild.members.cache.get(item.userId)?.fetch())}\n**When:** ${item.time}\n**Reason:** ${item.reason}\n\n`)),
    timeout: 60000
  })

}
