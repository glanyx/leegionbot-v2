import { PermissionFlagsBits, GuildMember, Attachment, EmbedBuilder, Colors, SlashCommandBuilder } from 'discord.js'
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'
import { logger } from '../../../utils'

const desc = 'Create a new ticket.'

const data = new SlashCommandBuilder()
  .setName('ticket')
  .setDescription(desc)
  .addStringOption(option =>
    option
      .setName('text')
      .setDescription('Message you would like to send.')
      .setRequired(true)
  )
  .addAttachmentOption(option =>
    option
      .setName('attachment')
      .setDescription('Do you have any attachments to add?')
  )
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)


export class Ticket extends SlashCommand {

  static description = desc
  static data = data

  public static async run({
    client,
    interaction
  }: SlashcommandInteractionArgs) {

    await interaction.deferReply({ ephemeral: true })

    const { ticketManager } = client.managers
    const { member: gMember, guild } = interaction
    const member = gMember as GuildMember

    const text: string | undefined = interaction.options.get('text')?.value as string | undefined
    const attachment: Attachment | undefined = interaction.options.get('attachment')?.attachment as Attachment | undefined

    if (!guild || !member) {

      return
    }

    let ticket = ticketManager.getTicketByMember(member) || await ticketManager.ticketSetup(member).catch(e => {
      logger.debug(e.message)
    })

    if (!ticket) return interaction.editReply('Unable to create ticket at this time. Please contact your server admin.')

    ticket.forwardToGuild({
      text,
      attachment,
    }).then(_ => {
      const embed = new EmbedBuilder()
        .setTitle('Message Sent!')
        .setColor(Colors.Green)

      if (text) embed.setDescription(text)
      if (attachment) embed.addFields({
        name: 'Attachment?',
        value: attachment ? 'Yes' : 'No'
      })

      interaction.editReply({
        embeds: [embed]
      })
    }).catch(_ => {
      const embed = new EmbedBuilder()
        .setTitle('Unable to deliver message')
        .setColor(Colors.Red)

      interaction.editReply({
        embeds: [embed]
      })
    })

  }

}