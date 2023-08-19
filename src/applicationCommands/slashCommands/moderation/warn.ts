import { GuildMember, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'
import { Warn as WarnUtil } from '../../../utils'

const desc = 'Warns a user.'

const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription(desc)
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('The user to warn.')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('reason')
      .setDescription('The reason for warning the specified user.')  
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
  .setDMPermission(false)

export class Warn extends SlashCommand {

  static description = desc
  static data = data

  public static async run({
    interaction,
  }: SlashcommandInteractionArgs) {

    await interaction.deferReply({ ephemeral: true })

    const { member, guild } = interaction

    if (!member || !guild) return
    
    const reason: string | undefined = interaction.options.get('reason')?.value as string | undefined
    const target = interaction.options.getMember('user') as GuildMember | null

    if (!reason) return interaction.editReply('Please provide a reason for this warning.')
    if (!target) return interaction.editReply('Unable to warn user at this time. Please try again later.')

    new WarnUtil({
      interaction,
      user: (member as GuildMember),
      target,
      reason,
    }).action()

  }
}