import { SlashCommandBuilder } from '@discordjs/builders'
import { PermissionFlagsBits } from 'discord.js'
import { logger } from '../utils'
import { SlashCommand, SlashcommandInteractionArgs } from './slashCommand'

const desc = 'Requests a sync for guild-specific Application Commands'

const data = new SlashCommandBuilder()
  .setName('sync')
  .setDescription(desc)
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

export class Sync extends SlashCommand {

  static description = desc
  static data = data

  public static async run({
    client,
    interaction
  }: SlashcommandInteractionArgs) {

    await interaction.deferReply()

    const { guild } = interaction
    if (!guild) return interaction.editReply('You must use this command in a server.')

    client.managers.applicationCommandManager.registerGuild(guild.id).then(_ => {
      interaction.editReply('Request sent!')
    }).catch(e => {
      logger.debug(e.message)
      interaction.editReply('Something went wrong.')
    })

  }

}