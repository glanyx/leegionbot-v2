import { GuildMember, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'
import { Kick as KickUtil } from '../../../utils'

const desc = 'Kicks a user.'

const data = new SlashCommandBuilder()
  .setName('kick')
  .setDescription(desc)
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('The user to kick.')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('reason')
      .setDescription('The reason for kicking the specified user.')  
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .setDMPermission(false)

export class Kick extends SlashCommand {

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

    if (!target) return interaction.editReply('Unable to kick user at this time. Please try again later.')

    new KickUtil({
      interaction,
      user: (member as GuildMember),
      target,
      reason,
    }).action()

  }
}