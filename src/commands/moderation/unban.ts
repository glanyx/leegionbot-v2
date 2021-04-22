import { Help, Config, IExecuteArgs, TextChannel, MessageEmbed } from 'discord.js'
import { modlogNotify } from '../../utils'

const help: Help = {
  name: "unban",
  category: "Moderation",
  description: "Rescinds a ban on the specified user.",
  usage: "unmute [userID]",
  example: [
    'unban 1234567890',
  ]
}

const configs: Config = {
  permissions: [
    'BAN_MEMBERS'
  ]
}

export class Unban {

  public static async run({
    message,
    args
  }: IExecuteArgs) {

    const { guild, channel, author } = message
    if (!guild) return

    const target = message.mentions.members && message.mentions.members.first() || { id: args[0] }

    const member = guild.members.cache.get(target.id)
    if (!member) {
      guild.members.unban(target.id)
    } else {
      await member.fetch()
      guild.members.unban(member)
    }

    const embed = new MessageEmbed()
      .setTitle(`Unban`)
      .setDescription(`This user has been unbanned.`)
      .setTimestamp()
      .setColor('#00ff00')
      
    if (member) embed
      .addField('User', `<@${member}>`, true)
      .addField('Actioned by', `<@${author}>`, true)
      .setAuthor(`${member.user.username}#${member.user.discriminator} [ID: ${member.user.id}]`, member.user.avatarURL() || undefined)

    modlogNotify(guild, embed, (channel as TextChannel))

  }

  public static get help() {
    return help
  }

  public static get configs() {
    return configs
  }

}