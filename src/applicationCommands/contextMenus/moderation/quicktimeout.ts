import { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits, GuildMember, User } from 'discord.js'
import { ContextMenu, ContextMenuInteractionArgs } from '../contextMenu'
import { ModActions } from "../../../utils"

const desc = 'Mutes a user'

const data = new ContextMenuCommandBuilder()
  .setName('quicktimeout')
  .setType(ApplicationCommandType.User)
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .setNameLocalizations({
    "en-GB": 'Quick Timeout (5m)',
    "en-US": 'Quick Timeout (5m)'
  })

export class QuickTimeout extends ContextMenu {

  static description = desc
  static data = data

  public static async execute({
    interaction,
  }: ContextMenuInteractionArgs) {

    const { guild, member, channel } = interaction

    const targetMember = interaction.options.getMember('user') as GuildMember | null
    if (!guild || !member) return

    const reason = 'No reason provided (Quick Action)'
    if (!targetMember) return interaction.editReply('Unable to mute at this time')

    if ((member as GuildMember).roles.highest.position <= targetMember.roles.highest.position && member.user.id !== guild.ownerId) return interaction.editReply(`You don't have the required permissions to perform this action!`)

    ModActions.mute(targetMember, reason, (member.user as User), 300000)

  }

}