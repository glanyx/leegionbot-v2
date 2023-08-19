import { GuildMember, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'
import { Mute as MuteUtil } from '../../../utils'

const MAX = 1000 * 60 * 60 * 24 * 7
const desc = 'Mutes a user.'

const data = new SlashCommandBuilder()
  .setName('mute')
  .setDescription(desc)
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('The user to mute.')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('reason')
      .setDescription('The reason for muting the specified user.')  
  )
  .addNumberOption(option =>
    option
      .setName('seconds')
      .setDescription('The amount of seconds to mute the user for.')  
  )
  .addNumberOption(option =>
    option
      .setName('minutes')
      .setDescription('The amount of seconds to mute the user for.')  
  )
  .addNumberOption(option =>
    option
      .setName('hours')
      .setDescription('The amount of seconds to mute the user for.')  
  )
  .addNumberOption(option =>
    option
      .setName('days')
      .setDescription('The amount of seconds to mute the user for.')  
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
  .setDMPermission(false)

export class Mute extends SlashCommand {

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

    if (!target) return interaction.editReply('Unable to mute user at this time. Please try again later.')

    if ((member as GuildMember).roles.highest.position <= target.roles.highest.position && (member as GuildMember).id !== guild.ownerId) return interaction.editReply(`You don't have the required permissions to perform this action!`)

    const seconds = (interaction.options.get('seconds')?.value as number | undefined) || 0
    const minutes = (interaction.options.get('minutes')?.value as number | undefined) || 0
    const hours = (interaction.options.get('hours')?.value as number | undefined) || 0
    const days = (interaction.options.get('days')?.value as number | undefined) || 0

    const sumDuration = (seconds + minutes * 60 + hours * 60 * 60 + days * 60 * 60 * 24) * 1000
    const duration = sumDuration === 0 ? undefined : sumDuration > MAX ? MAX : sumDuration

    new MuteUtil({
      interaction,
      user: (member as GuildMember),
      target,
      reason,
      duration,
    }).action()

  }
}