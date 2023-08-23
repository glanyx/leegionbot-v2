import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'
import { logger } from "../../../utils"

const desc = 'Purges a specified amount of messages from the current channel.'

const data = new SlashCommandBuilder()
  .setName('purge')
  .setDescription(desc)
  .addNumberOption(option =>
    option
      .setName('messages')
      .setDescription('The amount of messages to delete.')
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .setDMPermission(false)

export class Purge extends SlashCommand {

  static description = desc
  static data = data

  public static async run({
    interaction,
  }: SlashcommandInteractionArgs) {

    await interaction.deferReply({ ephemeral: true })

    const { channel } = interaction
    if (!channel) return interaction.editReply('Unable to purge messages at this time.')

    const messageCount = interaction.options.get('messages', true) as unknown as number

    const cycles = Math.floor(messageCount / 100)
    const remainder = messageCount % 100

    if (channel.type === ChannelType.GuildText) {

      for (let i = 0; i < cycles; i++) {
        channel.bulkDelete(100)
      }

      channel.bulkDelete(remainder)
        .then(() => interaction.editReply(`**${messageCount}** messages deleted!`)
          .catch((e: Error) => {
            logger.error(e)
          })
        )
        .catch((e: Error) => {
          interaction.editReply(`Something went wrong purging ${messageCount} messages!`)
          logger.error(e)
        })

    }

  }
}