import { Client, Colors, EmbedBuilder, Message } from 'discord.js'
import { ImageTool } from '../utils'
import { GuildSetting } from '../db/models'

const validContentTypes = [
  '.png',
  '.gif',
  '.jpg',
  '.jpeg',
]

export class ImageManager {

  constructor(client: Client) {
    client.on('messageCreate', (message) => {
      this.checkMessage(message)
    })
  }

  private checkMessage = (message: Message) => {

    if (!message.attachments || message.attachments.size < 1 || !message.inGuild()) return

    GuildSetting.fetchByGuildId(message.guildId)
      .then(async set => {

        if (!set || !set.modLogChannelId) return
        const ch = message.guild.channels.cache.get(set.modLogChannelId) || await message.guild.channels.fetch(set.modLogChannelId)
        if (!ch || !ch.isTextBased()) return

        message.attachments.forEach(att => {
          if (validContentTypes.includes(att.contentType || '')) {
            ImageTool.validateImage(att.url).then(({ report }) => {

              const embed = new EmbedBuilder()
                .setTitle('AI Art Detected')
                .setDescription(`AI Art was detected [here](${message.url})`)
                .setColor(Colors.Red)
                .setThumbnail(att.url)
                .setFields([
                  {
                    name: 'Human Confidence',
                    value: `${report.human.confidence}`,
                    inline: true
                  }, {
                    name: 'AI Confidence',
                    value: `${report.ai.confidence}`,
                    inline: true
                  }
                ])

              ch.send({ embeds: [embed] })

            })
          }
        })

      })
  }

}