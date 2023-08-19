import { GuildMember, User } from 'discord.js'
import { ButtonHandler, HandlerProps } from '../handler'
import { Kick } from "../../utils"

export class QuickKick extends ButtonHandler {

  public static async execute({
    interaction,
    args,
  }: HandlerProps) {

    if (!interaction.isButton()) return

    const { guild, member } = interaction

    const targetId = args.shift()
    if (!guild || !member) return

    const reason = 'No reason provided (Quick Action)'

    if (!targetId) return interaction.editReply('Unable to kick at this time')

    const target = guild.members.cache.get(targetId) || await guild.members.fetch(targetId)
    if (!target) return interaction.editReply('Unable to kick at this time')

    if ((member as GuildMember).roles.highest.position <= target.roles.highest.position && member.user.id !== guild.ownerId) return interaction.editReply(`You don't have the required permissions to perform this action!`)

    new Kick({
      user: (member as GuildMember),
      target,
      reason,
    })

  }

}