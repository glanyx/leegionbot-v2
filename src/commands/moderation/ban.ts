import { Help, Config, IExecuteArgs, MessageEmbed, TextChannel } from "discord.js"
import { ModLog, ModeratorAction, GuildSetting } from '../../db/models'
import { logger, modlogNotify } from "../../utils"

const configs: Config = {
  permissions: [
    'BAN_MEMBERS'
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

    try {
      const settings = await GuildSetting.fetchByGuildId(guild.id)
      const target = message.mentions.members && message.mentions.members.first() && message.mentions.members.first() || { id: args[0] }
      const reason = args.splice(1).join(' ') || 'No reason provided'

      const member = guild.members.cache.get(target.id)
      if (!member) return message.channel.send(`Unable to find member for arguments: ${args[0]}`)

      await member.fetch()

      if (authorMember.roles.highest.position <= member.roles.highest.position && authorMember !== guild.owner) return channel.send(`You don't have the required permissions to perform this action!`)
      
      const embed = new MessageEmbed()
        .setAuthor(`${member.user.username}#${member.user.discriminator} [ID: ${member.user.id}]`, member.user.avatarURL() || undefined)
        .setDescription(`This user has been banned.`)
        .addField('User', `<@${member.id}>`, true)
        .addField('Actioned by', `<@${author.id}>`, true)
        .addField('Reason', reason)
        .setTimestamp()
        .setColor('#FF0000')

      if (settings && settings.alertOnAction) {
        member.send(`You were banned from the \`${guild.name}\` Discord server for the following reason:\n${reason}`)
          .then(msg => {
            return msg
          })
          .catch(e => {
            logger.error(`Ban Error | User ID: ${member.user.id} | ${e.message}`)
          })
          .then(msg => {
            member.ban({ reason: reason.length > 512 ? `${reason.substr(0, 510)}..` : reason })
              .then(() => {
                ModLog.storeNewAction({
                  guildId: guild.id,
                  userId: author.id,
                  targetId: member.user.id,
                  action: ModeratorAction.BAN,
                  reason
                }).then(action => {
                  embed.setTitle(`ID ${action.id} | Ban`)
                  embed.addField('Received DM?', msg ? 'Yes' : 'No')
                  modlogNotify(guild, embed, (channel as TextChannel))
                }).catch(e => {
                  const text = `Ban executed, but unable to store \`ban\` action for User ID ${member.user.id}!`
                  logger.error(`${text}\n${e}`)
                  return message.channel.send(text)
                })
              })
            .catch(() => {
              if (msg) msg.delete()
              channel.send(`Unable to ban user <@${member}>.${msg ? ' **User may have seen notification of their ban.**' : ''} Please try again later.`)
            })
        })
      }
    } catch (e) {
      (await message.channel.send(`An error occured trying to ban the specified user. Please try again later.`)).delete({ timeout: 10 })
      logger.error(e)
    }

  }

  public static get help() {
    return help
  }

  public static get configs() {
    return configs
  }

}