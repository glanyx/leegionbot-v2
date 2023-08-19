import { GuildMember, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'
import { Unmute as UnmuteUtil } from '../../../utils'

const desc = 'Unmutes a user.'

const data = new SlashCommandBuilder()
  .setName('unmute')
  .setDescription(desc)
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('The user to unmute.')
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
  .setDMPermission(false)

export class Unmute extends SlashCommand {

  static description = desc
  static data = data

  public static async run({
    interaction,
  }: SlashcommandInteractionArgs) {

    await interaction.deferReply({ ephemeral: true })

    const { member, guild } = interaction

    if (!member || !guild) return
    
    const target = interaction.options.getMember('user') as GuildMember | null

    if (!target) return interaction.editReply('Unable to unmute user at this time. Please try again later.')

    new UnmuteUtil({
      interaction,
      user: (member as GuildMember),
      target,
    }).action()

  }
}