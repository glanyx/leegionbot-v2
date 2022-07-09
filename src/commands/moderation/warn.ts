import { Help, Config, IExecuteArgs, MessageEmbed, TextChannel } from "discord.js"
import { ModLog, ModeratorAction } from '../../db/models'
import { logger, modlogNotify } from "../../utils"

import { Paginator } from '../../utils/paginator'

const configs: Config = {
  permissions: [
    'MUTE_MEMBERS'
  ]
}

const help: Help = {
  name: "warn",
  category: "Moderation",
  description: "Warns the specified user.",
  usage: "warn [@user | userID] (reason)",
  example: [
    'warn @User',
    'warn 1234567890',
    'warn @User Breaking rule #1.',
    'warn 1234567890 Breaking rule #1.'
  ]
}


export class Warn {

  public static async run({
    message,
    args
  }: IExecuteArgs) {

    const { guild, author, channel, member: authorMember } = message
    if (!guild || !authorMember) return

    if (!args[0]) {
      channel.send('Please specify a user to warn!')
      return
    }
    
    await message.delete()

    try {
      const target = message.mentions.members && message.mentions.members.first() && message.mentions.members.first() || { id: args[0] }
      const reason = args.splice(1).join(' ') || 'No reason provided'

      const member = guild.members.cache.get(target.id)
      if (!member) return message.channel.send(`Unable to find member for arguments: ${args[0]}`)

      await member.fetch()
      
      if (authorMember.roles.highest.position <= member.roles.highest.position && authorMember.id !== guild.ownerId) return channel.send(`You don't have the required permissions to perform this action!`)
      
      const embed = new MessageEmbed()
        .setAuthor(`${member.user.username}#${member.user.discriminator} [ID: ${member.user.id}]`, member.user.avatarURL() || undefined)
        .setDescription(`This user has been warned.`)
        .addField('User', `<@${member.id}>`, true)
        .addField('Actioned by', `<@${author.id}>`, true)
        .addField('Reason', reason)
        .setTimestamp()
        .setColor('#FFA500')

      let success = false
      try {
        await member.send(`You were warned in the \`${guild.name}\` Discord server for the following reason:\n${reason}`)
        success = true
      } catch (e: any) {
        logger.error(`${e.message} - User ID: ${member.user.id}`)
      }
      embed.addField('Received DM?', success ? 'Yes' : 'No')
  
      await ModLog.storeNewAction({
        guildId: guild.id,
        userId: author.id,
        targetId: member.user.id,
        action: ModeratorAction.WARN,
        reason
      }).then(action => {
        embed.setTitle(`ID ${action.id} | Warn`)
      }).catch(e => {
        const text = `Unable to store \`warn\` action for User ID ${member.user.id}!`
        logger.error(`${text}\n${e}`)
        return message.channel.send(text)
      })
      
      modlogNotify(guild, { embed }, (channel as TextChannel))

    } catch (e) {
      await message.channel.send(`An error occured trying to warn the specified user. Please try again later.`).then(msg => setTimeout(() => msg.delete(), 5000))
      logger.error(e)
    }

  }

  public static get help() {
    return help
  }

  public static get configs() {
    return configs
  }

  public static get subcommands() {
    return [WarnList]
  }

}

const listHelp: Help = {
  name: "list",
  category: "Moderation",
  description: "Lists all warnings for the specified user.",
  usage: "warn list [@user | userID]",
  example: [
    'warn list @User',
    'warn list 1234567890',
  ]
}

const listConfigs: Config = {

}

class WarnList {

  public static async run ({
    message,
    args
  }: IExecuteArgs) {

    const { guild, channel } = message
    if (!guild) return

    if (!args[0]) {
      channel.send('Please specify a user to search logs for!')
      return
    }

    const target = message.mentions.members && message.mentions.members.first() && message.mentions.members.first() || { id: args[0] }

    const member = guild.members.cache.get(target.id)
    if (!member) return message.channel.send(`Unable to find member for arguments: ${args[0]}`)

    const { items: warnings } = await ModLog.fetchByUserId(guild.id, target.id, ModeratorAction.WARN)

    new Paginator({
      channel: message.channel,
      author: message.author,
      items: await Promise.all(warnings.map(async warn => `**Warning**\n**Actioned by:** <@${(await guild.members.cache.get(warn.userId)?.fetch())}>\n**When:** ${warn.time}\n**Reason:** ${warn.reason}\n\n`))
    })

  }

  public static get help() {
    return listHelp
  }

  public static get configs() {
    return listConfigs
  }

}