import { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits, Message, Colors, EmbedBuilder, MessageContextMenuCommandInteraction } from 'discord.js'
import { MessageContextMenu, MessageContextMenuInteractionArgs } from '../messageContextMenu'
import { ImageTool, Report } from '../../../utils'

const validContentTypes = [
  'png',
  'gif',
  'jpg',
  'jpeg',
]

const keys = ['dall_e', 'midjourney', 'stable_diffusion', 'this_person_does_not_exist']

const desc = 'Scans a message for AI art'

const data = new ContextMenuCommandBuilder()
  .setName('aiScan')
  .setType(ApplicationCommandType.Message)
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .setNameLocalizations({
    "en-GB": 'Scan for AI',
    "en-US": 'Scan for AI'
  })

export class AiScan extends MessageContextMenu {

  static description = desc
  static data = data

  public static async run({
    interaction,
  }: MessageContextMenuInteractionArgs) {

    interaction.deferReply({ ephemeral: true })

    const { targetMessage } = interaction

    checkMessage(targetMessage, interaction)

  }

}

const checkMessage = async (message: Message, interaction: MessageContextMenuCommandInteraction) => {

  const reports: Array<Report> = []

  if (message.attachments.size > 0) {
    const attachmentReports = await Promise.all(message.attachments.map(att => {
      if (validContentTypes.map(t => `image/${t}`).includes(att.contentType || '')) return ImageTool.validateImage(att.url)
    }))
    attachmentReports.forEach(rep => { if (rep) reports.push(rep) })
  }

  if (message.embeds.length > 0) {
    const embedReports = await Promise.all(message.embeds.map(emb => {
      if (!emb.image) return
      if (validContentTypes.map(t => `.${t}`).some(t => emb.image?.url.includes(t))) return ImageTool.validateImage(emb.image.url)
    }))
    embedReports.forEach(rep => { if (rep) reports.push(rep) })
  }

  const filteredReports = reports.filter(r => r.report.ai.is_detected)

  if (filteredReports.length === 0) return interaction.editReply('No images are suspected of AI')

  const embeds = filteredReports.map(({ report: rep, imageUrl }) => {

    const algorithm = keys.reduce((a, b) => rep[a].confidence > rep[b].confidence ? a : b)
    return new EmbedBuilder()
      .setTitle('Suspected of AI Art')
      .setThumbnail(imageUrl)
      .setColor(Colors.Red)
      .setFields([
        {
          name: 'Human Confidence',
          value: `${rep.human.confidence.toFixed(4)}`,
          inline: true
        }, {
          name: 'AI Confidence',
          value: `${rep.ai.confidence.toFixed(4)}`,
          inline: true
        }, {
          name: 'Suspected Algorithm',
          value: `${algorithm} (Confidence: ${rep[algorithm].confidence.toFixed(4)})`
        }
      ])

  })

  interaction.editReply({ embeds })

}