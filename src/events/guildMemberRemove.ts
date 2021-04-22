import { Client, GuildMember, TextChannel, MessageEmbed } from 'discord.js'
import { GuildSetting } from '../db/models'
import { logger, format } from '../utils'

export class GuildMemberRemove {

  public static async execute(_: Client, member: GuildMember) {

    const { guild } = member

    logger.info(`Member Left: ${member.user.id} on Guild ${guild.id}`)

    const settings = await GuildSetting.fetchByGuildId(guild.id)
    if (!settings) return
    const { memberLogChannelId } = settings

    if (memberLogChannelId) {
      const channel = member.guild.channels.cache.get(memberLogChannelId)

      if (channel) {
        await channel.fetch()

        const embed = new MessageEmbed()
          .setTitle('Member Left')
          .setAuthor(`${member.user.username}#${member.user.discriminator}`, member.user.displayAvatarURL() || undefined)
          .setThumbnail(member.user.displayAvatarURL())
          .setFooter(`User ID: ${member.user.id}`)
          .setTimestamp()
          .setColor('#FF0000')
          .addField('Joined on', member.joinedAt ? format(member.joinedAt) : '*Unknown*')

        if (channel.type === 'text') {
          (channel as TextChannel).send(embed)
        }
        
      }
    }
  return
  }

}