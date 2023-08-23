import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'
import { logger } from "../../../utils"

const MAX = 60 * 60 * 6
const desc = 'Sets slowmode on the current channel.'

const data = new SlashCommandBuilder()
  .setName('slowmode')
  .setDescription(desc)
  .addNumberOption(option =>
    option
      .setName('seconds')
      .setDescription('The amount of seconds to set slowmode for.')
  )
  .addNumberOption(option =>
    option
      .setName('minutes')
      .setDescription('The amount of seconds to set slowmode for.')
  )
  .addNumberOption(option =>
    option
      .setName('hours')
      .setDescription('The amount of seconds to set slowmode for.')
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .setDMPermission(false)

export class Slowmode extends SlashCommand {

  static description = desc
  static data = data

  public static async run({
    interaction,
  }: SlashcommandInteractionArgs) {

    await interaction.deferReply({ ephemeral: true })

    const { channel, guild } = interaction
    if (!channel || !guild) return interaction.editReply('Unable to set slowmode at this time.')

    const seconds = (interaction.options.get('seconds')?.value as number | undefined) || 0
    const minutes = (interaction.options.get('minutes')?.value as number | undefined) || 0
    const hours = (interaction.options.get('hours')?.value as number | undefined) || 0

    const sumDuration = (seconds + minutes * 60 + hours * 60 * 60)
    const duration = sumDuration === 0 ? undefined : sumDuration > MAX ? MAX : sumDuration

    if (channel.type === ChannelType.GuildText) {
      logger.info(`Updating slowmode in Guild ID ${guild.id}, Channel ID ${channel.id} to ${duration} seconds`);
      channel.setRateLimitPerUser(duration || 0).then(() => {
        interaction.editReply(duration === 0 ? `Successfully removed slowmode for ${channel}.` : `Successfully set slowmode for ${channel} to ${duration} seconds.`)
      })
    } else {
      interaction.editReply('Unable to set slowmode on specified channel.')
      return
    }

  }

}