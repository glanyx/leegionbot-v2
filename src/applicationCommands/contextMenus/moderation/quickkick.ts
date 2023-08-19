import { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits, GuildMember, User } from 'discord.js'
import { ContextMenu, ContextMenuInteractionArgs } from '../contextMenu'
import { Kick } from "../../../utils"

const desc = 'Kicks a user'

const data = new ContextMenuCommandBuilder()
  .setName('quickkick')
  .setType(ApplicationCommandType.User)
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .setNameLocalizations({
    "en-GB": 'Quick Kick',
    "en-US": 'Quick Kick'
  })

export class QuickKick extends ContextMenu {

  static description = desc
  static data = data

  public static async execute({
    interaction,
  }: ContextMenuInteractionArgs) {

    const { guild, member } = interaction

    const target = interaction.options.getMember('user') as GuildMember | null
    if (!guild || !member) return

    const reason = 'No reason provided (Quick Action)'
    if (!target) return interaction.editReply('Unable to kick at this time')

    if ((member as GuildMember).roles.highest.position <= target.roles.highest.position && member.user.id !== guild.ownerId) return interaction.editReply(`You don't have the required permissions to perform this action!`)

    new Kick({
      interaction,
      user: (member as GuildMember),
      target,
      reason,
    })

  }

}