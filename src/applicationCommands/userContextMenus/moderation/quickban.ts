import { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits, GuildMember, User } from 'discord.js'
import { UserContextMenu, UserContextMenuInteractionArgs } from '../userContextMenu'
import { Ban } from "../../../utils"

const desc = 'Bans a user'

const data = new ContextMenuCommandBuilder()
  .setName('quickban')
  .setType(ApplicationCommandType.User)
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .setNameLocalizations({
    "en-GB": 'Quick Ban',
    "en-US": 'Quick Ban'
  })

export class QuickBan extends UserContextMenu {

  static description = desc
  static data = data

  public static async run({
    interaction,
  }: UserContextMenuInteractionArgs) {

    const { guild, member } = interaction

    const target = interaction.options.getMember('user') as GuildMember | null
    if (!guild || !member) return

    const reason = 'No reason provided (Quick Action)'
    if (!target) return interaction.editReply('Unable to ban at this time')

    if ((member as GuildMember).roles.highest.position <= target.roles.highest.position && member.user.id !== guild.ownerId) return interaction.editReply(`You don't have the required permissions to perform this action!`)

    new Ban({
      interaction,
      user: (member as GuildMember),
      target,
      reason,
    })

  }

}