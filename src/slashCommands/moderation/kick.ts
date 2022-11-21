import { SlashCommandBuilder } from '@discordjs/builders'
import { GuildMember, PermissionFlagsBits } from 'discord.js'
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'
import { ModActions } from "../../utils"

const desc = 'Kicks the specified user.'

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
      .setDescription('Reason for the kick. This is sent to the user.')
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .setDMPermission(false)

export class Kick extends SlashCommand {

  static description = desc
  static data = data

  public static async run({
    client,
    interaction,
  }: SlashcommandInteractionArgs) {

    const { guild, member } = interaction
    if (!guild || !member) return

    const target = interaction.options.getMember('user')
    const reason: string | undefined = interaction.options.get('reason')?.value as string | undefined

    if (!target) return interaction.reply({ content: 'Unable to kick specified user.', ephemeral: true })

    if ((member as GuildMember).roles.highest.position <= (target as GuildMember).roles.highest.position && member.user.id !== guild.ownerId) return interaction.reply({ content: `You don't have the required permissions to perform this action!`, ephemeral: true })

    // await interaction.deferReply()

    // ModActions.kick(target, , reason, member)

  }

}