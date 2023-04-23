import { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits, GuildMember, User } from 'discord.js'
import { ContextMenu, ContextMenuInteractionArgs } from '../contextMenu'
import { ModActions } from "../../../utils"

const desc = 'Bans a user'

const data = new ContextMenuCommandBuilder()
  .setName('quickban')
  .setType(ApplicationCommandType.User)
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .setNameLocalizations({
    "en-GB": 'Quick Ban',
    "en-US": 'Quick Ban'
  })

export class QuickBan extends ContextMenu {

  static description = desc
  static data = data

  public static async execute({
    interaction,
  }: ContextMenuInteractionArgs) {

    const { guild, member, channel } = interaction

    const targetMember = interaction.options.getMember('user') as GuildMember | null
    if (!guild || !member) return

    const reason = 'No reason provided (Quick Action)'
    if (!targetMember) return interaction.editReply('Unable to ban at this time')

    if ((member as GuildMember).roles.highest.position <= targetMember.roles.highest.position && member.user.id !== guild.ownerId) return interaction.editReply(`You don't have the required permissions to perform this action!`)

    ModActions.ban(targetMember, (channel as any), reason, (member.user as User))

  }

}