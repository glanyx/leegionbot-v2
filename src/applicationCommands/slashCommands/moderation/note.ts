import { GuildMember, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'
import { Note as NoteUtil } from '../../../utils'

const desc = 'Makes a note on a user.'

const data = new SlashCommandBuilder()
  .setName('note')
  .setDescription(desc)
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('The user to make a note on.')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('reason')
      .setDescription('The reason for making a note on the specified user.')  
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
  .setDMPermission(false)

export class Note extends SlashCommand {

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

    if (!reason) return interaction.editReply('Please provide a reason for this note.')
    if (!target) return interaction.editReply('Unable to make a note on user at this time. Please try again later.')

    new NoteUtil({
      interaction,
      user: (member as GuildMember),
      target,
      reason,
    }).action()

  }
}