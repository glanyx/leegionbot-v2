import { Client, User, EmbedBuilder, TextChannel } from 'discord.js'
import { GuildSetting } from '../db/models'

export class UserUpdate {

  public static async execute(client: Client, userOld: User, user: User) {

    // Username Change
    if (userOld.username !== user.username) {

      client.guilds.cache.filter(guild => guild.members.cache.has(user.id)).forEach(async guild => {

        await guild.fetch()
        const member = guild.members.cache.get(user.id)

        if (!member) return
        await member.fetch() 

        const settings = await GuildSetting.fetchByGuildId(guild.id)
        if (!settings) return

        const { memberLogChannelId } = settings

        const channel = guild.channels.cache.get(memberLogChannelId) as TextChannel
        if (!channel) return

        const embed = new EmbedBuilder()
          .setColor('#00dbff')
          .setAuthor({
            name: `${user.username}#${user.discriminator}`,
            iconURL: user.avatarURL() || undefined,
          })
          .setTitle('Username Updated')
          .setDescription(`${user}`)
          .addFields({
            name: 'Old Username', 
            value: `${userOld.username}`,
            inline: true,
          }, {
            name: 'New Username',
            value: `${user.username}`,
            inline: true,
          })
          .setTimestamp()

        channel.send({ embeds: [embed] })
      })

    }
    
    // Avatar Change
    if (userOld.avatarURL() !== user.avatarURL()) {

      client.guilds.cache.filter(guild => guild.members.cache.has(user.id)).forEach(async guild => {

        await guild.fetch()
        const member = guild.members.cache.get(user.id)

        if (!member) return
        await member.fetch()

        const settings = await GuildSetting.fetchByGuildId(guild.id)
        if (!settings) return

        const { memberLogChannelId } = settings

        const channel = guild.channels.cache.get(memberLogChannelId) as TextChannel
        if (!channel) return

        const defaultImage = 'https://discord.com/assets/6debd47ed13483642cf09e832ed0bc1b.png'

        const embed = new EmbedBuilder()
          .setColor('#00dbff')
          .setAuthor({
            name: `${user.username}#${user.discriminator}`,
            iconURL: user.avatarURL() || defaultImage,
          })
          .setTitle('Avatar Updated')
          .setDescription(`${user}`)
          .setImage(user.avatarURL({ size: 256 }) || defaultImage)
          .addFields({
            name: 'New Avatar',
            value: 'Image below.',
            inline: true,
          }, {
            name: 'Old Avatar',
            value: 'Thumbnail on the right.',
            inline: true,
          })
          .setThumbnail(userOld.avatarURL() || defaultImage)
          .setTimestamp()

        channel.send({ embeds: [embed] })
      })

    }

  }

}