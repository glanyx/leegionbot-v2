import { GuildMember, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'
import { Unban as UnbanUtil } from '../../../utils'

const desc = 'Unbans a user.'

const data = new SlashCommandBuilder()
  .setName('unban')
  .setDescription(desc)
  .addStringOption(option =>
    option
      .setName('userid')
      .setDescription('The ID of the user to unban.')
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .setDMPermission(false)

export class Unban extends SlashCommand {

  static description = desc
  static data = data

  public static async run({
    interaction,
  }: SlashcommandInteractionArgs) {

    await interaction.deferReply({ ephemeral: true })

    const { member, guild } = interaction

    if (!member || !guild) return
    
    const targetId: string | undefined = interaction.options.get('userid')?.value as string | undefined

    if (!targetId) return interaction.editReply('Unable to unban user at this time. Please try again later.')

    new UnbanUtil({
      interaction,
      user: (member as GuildMember),
      targetId,
    }).action()

  }
}