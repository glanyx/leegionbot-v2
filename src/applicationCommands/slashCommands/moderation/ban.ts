import { GuildMember, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'
import { Ban as BanUtil } from '../../../utils'

const desc = 'Bans a user.'

const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription(desc)
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('The user to ban.')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('reason')
      .setDescription('The reason for banning the specified user.')  
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .setDMPermission(false)

export class Ban extends SlashCommand {

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

    if (!target) return interaction.editReply('Unable to ban user at this time. Please try again later.')

    new BanUtil({
      interaction,
      user: (member as GuildMember),
      target,
      reason,
    }).action()

  }
}