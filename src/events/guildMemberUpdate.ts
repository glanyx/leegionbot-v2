import { Client, GuildMember, MessageEmbed, TextChannel } from 'discord.js'
import { GuildSetting } from '../db/models'

export class GuildMemberUpdate {

  public static async execute(client: Client, memberOld: GuildMember, member: GuildMember) {

    const { guild, user } = member

    // Nickname Change
    if (memberOld.nickname !== member.nickname) {

      const settings = await GuildSetting.fetchByGuildId(guild.id)
      if (!settings) return
  
      const { memberLogChannelId } = settings
  
      const channel = guild.channels.cache.get(memberLogChannelId) as TextChannel
      if (!channel) return

      const embed = new MessageEmbed()
        .setColor('#00dbff')
        .setAuthor(`${user.username}#${user.discriminator}`, user.avatarURL() || undefined)
        .setTitle(`Nickname Updated`)
        .setDescription(`<@${user}>`)
        .addField('Old Nickname', `${memberOld.nickname || '*None*'}`, true)
        .addField('New Nickname', `${member.nickname || '*None*'}`, true)
        .setTimestamp()
  
      channel.send(embed)

    }

  }
}