import { Client, GuildMember, EmbedBuilder, TextChannel } from 'discord.js'
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

      const embed = new EmbedBuilder()
        .setColor('#00dbff')
        .setAuthor({
          name: `${user.username}#${user.discriminator}`,
          iconURL: user.displayAvatarURL()
        })
        .setTitle(`Nickname Updated`)
        .setDescription(`${user}`)
        .addFields({
          name: 'Old Nickname',
          value: `${memberOld.nickname || '*None*'}`,
          inline: true
        }, {
          name: 'New Nickname',
          value: `${member.nickname || '*None*'}`,
          inline: true,
        })
        .setTimestamp()

      channel.send({ embeds: [embed] })

    }

  }
}