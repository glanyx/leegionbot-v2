import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'
import { CommandLevel } from '../../utils'

const desc = 'Ticketer setup command that initializes the Ticketer system.'

const data = new SlashCommandBuilder()
  .setName('setup')
  .setDescription(desc)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

export class Setup extends SlashCommand {

  static description = desc
  static data = data
  static level = CommandLevel.GUILD

  public static async run({
    interaction
  }: SlashcommandInteractionArgs) {

    await interaction.deferReply({ ephemeral: true })

    const { guild } = interaction

    if (!guild) throw new Error('NO_GUILD_FOUND')

    guild.channels.create({
      name: 'tickets',
      type: ChannelType.GuildForum,
    }).then(forum => {
      forum.threads.create({
        name: 'Ticket Logs',
        message: {
          content: 'New tickets and closed tickets will be logged here.',
        }
      }).then(_ => {
        interaction.editReply('Setup complete!')
      })
    }).catch(_ => {
      // Forums aren't available or bot doesn't have permission
      guild.channels.create({
        name: 'tickets',
        type: ChannelType.GuildCategory,
      }).then(cat => {
        guild.channels.create({
          name: 'ticket-logs',
          parent: cat
        }).then(_ => {
          interaction.editReply('Setup complete!')
        })
      })
    })

  }

}