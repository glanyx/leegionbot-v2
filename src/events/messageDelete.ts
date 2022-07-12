import { Client, Message, MessageEmbed, TextChannel } from 'discord.js'
import { GuildSetting } from '../db/models'

export class MessageDelete {

  public static async execute(client: Client, message: Message) {
    
    if (message.author.id === client.user?.id) return

    const { guild } = message
    if (!guild) return

    const settings = await GuildSetting.fetchByGuildId(guild.id)
    if (!settings) return

    const { messageLogChannelId } = settings

    const channel = guild.channels.cache.get(messageLogChannelId) as TextChannel
    if (!channel) return

    const embed = new MessageEmbed()
      .setColor('#ff0000')
      .setAuthor({
        name: `${message.author.username || 'Unknown'}#${message.author.discriminator || '0000'}`,
        iconURL: message.author.displayAvatarURL()
      })
      .setTitle(`Message Deleted`)
      .addField('Channel', `${message.channel}` || 'Unable to retrieve', true)
      .addField('Author', `${message.author}` || 'Unable to retrieve', true)
      .setTimestamp()

    if (message.content) {
      embed.setDescription(message.content)
    }

    if (message.attachments.size > 0) {
      [...message.attachments.values()].forEach((attachment, index) => {
        embed.addField(`Attachment ${index + 1}`, attachment.url)
      })
    }

    if (!message.content && message.attachments.size === 0) embed.setDescription('Unable to retrieve content')

    channel.send({ embeds: [embed] })

  }

}