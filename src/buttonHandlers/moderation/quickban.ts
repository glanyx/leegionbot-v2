import { GuildMember, PermissionFlagsBits, User } from 'discord.js'
import { ButtonHandler, HandlerProps } from '../handler'
import { Ban } from "../../utils"

export class QuickBan extends ButtonHandler {

  public static async execute({
    interaction,
    args,
  }: HandlerProps) {

    if (!interaction.isButton()) return

    const { guild, member } = interaction

    const targetId = args.shift()
    if (!guild || !member) return

    if (!(member as GuildMember).permissions.has(PermissionFlagsBits.BanMembers)) return interaction.editReply('You are not allowed to perform this action!')

    const reason = 'No reason provided (Quick Action)'

    if (!targetId) return interaction.editReply('Unable to ban at this time')

    const target = guild.members.cache.get(targetId) || await guild.members.fetch(targetId)
    if (!target) return interaction.editReply('Unable to ban at this time')

    if ((member as GuildMember).roles.highest.position <= target.roles.highest.position && member.user.id !== guild.ownerId) return interaction.editReply(`You don't have the required permissions to perform this action!`)

    new Ban({
      user: (member as GuildMember),
      target,
      reason,
    })

  }

}