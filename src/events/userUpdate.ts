import { Client, User, MessageEmbed, TextChannel } from 'discord.js'
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
    
        const embed = new MessageEmbed()
          .setColor('#00dbff')
          .setAuthor(`${user.username}#${user.discriminator}`, user.avatarURL() || undefined)
          .setTitle(`Username Updated`)
          .setDescription(`<@${user}>`)
          .addField('Old Username', `${userOld.username}`, true)
          .addField('New Username', `${user.username}`, true)
          .setTimestamp()
    
        channel.send(embed)
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
    
        const embed = new MessageEmbed()
          .setColor('#00dbff')
          .setAuthor(`${user.username}#${user.discriminator}`, user.avatarURL() || defaultImage)
          .setTitle(`Avatar Updated`)
          .setDescription(`<@${user}>`)
          .addField('New Avatar', 'Image below.', true)
          .setImage(user.avatarURL({ size: 256 }) || defaultImage)
          .addField('Old Avatar', 'Thumbnail on the right.', true)
          .setThumbnail(userOld.avatarURL() || defaultImage)
          .setTimestamp()
    
        channel.send(embed)
      })
    
    }

  }

}