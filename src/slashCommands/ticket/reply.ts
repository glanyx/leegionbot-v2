import { PermissionFlagsBits, Attachment, ChannelType, GuildMember, EmbedBuilder, Colors } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'
import { CommandLevel } from '../../utils'

const desc = 'Sends a reply on the ticket associated to this channel.'

const data = new SlashCommandBuilder()
  .setName('reply')
  .setDescription(desc)
  .addBooleanOption(option =>
    option
      .setName('anonymous')
      .setDescription('Respond to the ticket anonymously?')
  )
  .addStringOption(option =>
    option
      .setName('text')
      .setDescription('Message you would like to send.')
  )
  .addAttachmentOption(option =>
    option
      .setName('attachment')
      .setDescription('Do you have any attachments to add?')
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)

export class Reply extends SlashCommand {

  static description = desc
  static data = data
  static level = CommandLevel.GUILD

  public static async run({
    client,
    interaction
  }: SlashcommandInteractionArgs) {

    await interaction.deferReply()

    const { ticketManager } = client.managers
    const { guild, channel, member: gMember } = interaction
    const member = gMember as GuildMember

    const text: string | undefined = interaction.options.get('text')?.value as string | undefined
    const attachment: Attachment | undefined = interaction.options.get('attachment')?.value as Attachment | undefined
    const anonymous: boolean | undefined = interaction.options.get('anonymous')?.value as boolean | undefined

    if (!guild || !member) throw new Error('NO_GUILD_FOUND')
    if (!channel || channel.type !== ChannelType.GuildText) throw new Error('CHANNEL_MISMATCH')

    const ticket = ticketManager.getTicketByChannel(channel)
    if (!ticket) return interaction.editReply('No ticket relating to this channel found.')

    await ticket.forwardToMember({
      user: member,
      text,
      attachment,
      anonymous,
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