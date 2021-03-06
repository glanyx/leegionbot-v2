import { Client, Message, MessageEmbed, TextChannel } from 'discord.js'
import { GuildSetting } from '../db/models'
import { logger } from '../utils'

export class MessageUpdate {

  public static async execute(client: Client, messageOld: Message, message: Message) {

    if (message.author.id === client.user?.id) return
    if (messageOld.content === message.content && messageOld.attachments.size === message.attachments.size) return

    const { guild, author, content, url } = message
    if (!guild) return

    logger.debug(`Message ID ${message.id} updated on Guild ID ${message.guild?.id}`)

    const settings = await GuildSetting.fetchByGuildId(guild.id)
    if (!settings) return

    const { messageLogChannelId } = settings

    const channel = guild.channels.cache.get(messageLogChannelId) as TextChannel
    if (!channel) return

    const embed = new MessageEmbed()
      .setColor('#00dbff')
      .setAuthor(`${author.username || 'Unknown'}#${author.discriminator || '0000'}`, author.avatarURL() || undefined)
      .setTitle(`Message Edited`)
      .setDescription(`[Link](${url})`)
      .addField('Author', `<@${author}>`)
      .addField('Before', messageOld.content ? messageOld.content.length > 1024 ? `${messageOld.content.substr(0, 1022)}..` : messageOld.content : '*None*')
      .addField('After', content ? content.length > 1024 ? `${content.substr(0, 1022)}..` : content : '*None*')
      .setTimestamp()

    if (messageOld.content) embed

    messageOld.attachments.array().forEach((attachment, index) => {
      embed.addField(`Old Attachment ${index + 1}`, attachment.url)
    })

    message.attachments.array().forEach((attachment, index) => {
      embed.addField(`New Attachment ${index + 1}`, attachment.url)
    })

    channel.send(embed)

  }

}