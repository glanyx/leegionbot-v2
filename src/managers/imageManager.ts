import { Client, Colors, EmbedBuilder, Message, TextBasedChannel } from 'discord.js'
import { ImageTool } from '../utils'
import { GuildSetting } from '../db/models'

const validContentTypes = [
  'png',
  'gif',
  'jpg',
  'jpeg',
]

export class ImageManager {

  constructor(client: Client) {
    client.on('messageCreate', (message) => {
      this.checkMessage(message)
    })
  }

  private checkMessage = (message: Message) => {

    if (message.attachments.size > 0) message.attachments.forEach(att => {
      if (validContentTypes.map(t => `image/${t}`).includes(att.contentType || '')) this.checkImage(att.url, message)
    })

    if (message.embeds.length > 0) message.embeds.forEach(emb => {
      if (!emb.image) return
      if (validContentTypes.map(t => `.${t}`).some(t => emb.image?.url.includes(t))) this.checkImage(emb.image?.url, message)
    })

  }

  private checkImage = (imageUrl: string, message: Message) => {

    if (!message.inGuild()) return

    GuildSetting.fetchByGuildId(message.guildId)
      .then(async set => {

        if (!set || !set.modLogChannelId) return
        const ch = message.guild.channels.cache.get(set.modLogChannelId) || await message.guild.channels.fetch(set.modLogChannelId)
        if (!ch || !ch.isTextBased()) return

        ImageTool.validateImage(imageUrl).then(({ report }) => {

          const keys = ['dall_e', 'midjourney', 'stable_diffusion', 'this_person_does_not_exist']
          const algorithm = keys.reduce((a, b) => report[a].confidence > report[b].confidence ? a : b)

          const embed = new EmbedBuilder()
            .setTitle('AI Art Detected')
            .setDescription(`AI Art was detected [here](${message.url})`)
            .setColor(Colors.Red)
            .setThumbnail(imageUrl)
            .setFields([
              {
                name: 'Human Confidence',
                value: `${report.human.confidence}`,
                inline: true
              }, {
                name: 'AI Confidence',
                value: `${report.ai.confidence}`,
                inline: true
              }, {
                name: 'Suspected Algorithm',
                value: `${algorithm} (Confidence: ${report[algorithm].confidence})`
              }
            ])

          if (report.ai.is_detected) ch.send({ embeds: [embed] })

        }).catch(e => console.log(e.message))

      })
  }
}