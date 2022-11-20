import { PermissionFlagsBits } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'
import { CommandLevel } from '../../utils'

import { Ticket } from '../../db/models'

const desc = 'Receive a transcript for the specified Ticket ID'

const data = new SlashCommandBuilder()
  .setName('log')
  .setDescription(desc)
  .addNumberOption(option =>
    option
      .setName('id')
      .setDescription('ID of the ticket you want the chat transcript for.')
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)

export class Log extends SlashCommand {

  static description = desc
  static data = data
  static level = CommandLevel.GUILD
  
  public static async run({
    client,
    interaction
  }: SlashcommandInteractionArgs) {

    await interaction.deferReply()

    const { guild } = interaction

    if (!guild) throw new Error('MISSING_GUILD')

    const ticketId: number = interaction.options.get('id', true).value as number
    
    const ticket = await Ticket.fetchSingle(guild.id, ticketId)
    if (!ticket) return interaction.editReply('Unable to find a ticket by that ID.')

    const { items: messages } = await ticket.fetchMessages()

  }

}