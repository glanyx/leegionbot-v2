import { Client, Message, EmbedBuilder, TextChannel, BufferResolvable } from 'discord.js'
import { GuildSetting } from '../db/models'
import { Stream } from 'stream'

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

    const attachments: Array<BufferResolvable | Stream> = []

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setAuthor({
        name: `${message.author.username || 'Unknown'}#${message.author.discriminator || '0000'}`,
        iconURL: message.author.displayAvatarURL()
      })
      .setTitle(`Message Deleted`)
      .addFields({
        name: 'Channel',
        value: `${message.channel}` || 'Unable to retrieve',
        inline: true,
      }, {
        name: 'Author',
        value: `${message.author}` || 'Unable to retrieve',
        inline: true,
      })
      .setTimestamp()

    if (message.content) {
      embed.setDescription(message.content)
    }

    if (message.attachments.size > 0) {
      embed.addFields({
        name: 'Attachments',
        value: `${message.attachments.size}`,
        inline: true
      })
    }

    if (message.attachments.size > 0) {
      [...message.attachments.values()].forEach((attachment) => {
        if (attachment.contentType !== null && ['jpg', 'jpeg', 'png', 'gif'].includes(attachment.contentType)) {
          attachments.push(attachment.attachment)
        }
      })
    }

    if (!message.content && message.attachments.size === 0) embed.setDescription('Unable to retrieve content')

    channel.send({ embeds: [embed], files: attachments })

  }

}