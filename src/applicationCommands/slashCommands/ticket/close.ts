import { ChannelType, PermissionFlagsBits, GuildMember, EmbedBuilder, Colors, SlashCommandBuilder } from 'discord.js'
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'
import { logger, CommandLevel } from '../../../utils'

const desc = 'Closes the ticket associated to this channel.'

const data = new SlashCommandBuilder()
  .setName('close')
  .setDescription(desc)
  .addBooleanOption(option =>
    option
      .setName('anonymous')
      .setDescription('Close the ticket anonymously?')
  )
  .addStringOption(option =>
    option
      .setName('reason')
      .setDescription('Optional reason for closing the ticket.')
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)

export class Close extends SlashCommand {

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

    const reason: string | undefined = interaction.options.get('reason')?.value as string | undefined
    const anonymous: boolean | undefined = interaction.options.get('anonymous')?.value as boolean | undefined

    if (!guild) throw new Error('NO_GUILD_FOUND')
    if (!channel || (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.PublicThread && channel.type !== ChannelType.PrivateThread)) throw new Error('CHANNEL_MISMATCH')

    const ticket = ticketManager.getTicketByChannel(channel)
    if (!ticket) return interaction.editReply('No ticket relating to this channel found.')

    await ticket.close({
      user: member,
      reason,
      anonymous,
    }).then(_ => {
      const embed = new EmbedBuilder()
        .setTitle('Ticket Closed!')
        .setColor(Colors.Green)

      if (reason) embed.setDescription(reason)

      interaction.editReply({
        content: 'This channel will be deleted in 5 seconds',
        embeds: [embed]
      }).then(_ => {
        setTimeout(() => {
          channel.delete().catch(e => {
            logger.debug(e.message)
            interaction.editReply('Unable to delete channel. Please delete manually.')
          })
        }, 5000)
      })
    }).catch(_ => {
      const embed = new EmbedBuilder()
        .setTitle('Unable to close ticket')
        .setColor(Colors.Red)

      interaction.editReply({
        embeds: [embed]
      })
    })

  }

}