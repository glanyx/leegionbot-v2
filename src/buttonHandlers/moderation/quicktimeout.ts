import { GuildMember, User } from 'discord.js'
import { ButtonHandler, HandlerProps } from '../handler'
import { Mute } from "../../utils"

export class QuickTimeout extends ButtonHandler {

  public static async execute({
    interaction,
    args,
  }: HandlerProps) {

    if (!interaction.isButton()) return

    const { guild, member } = interaction

    const targetId = args.shift()
    if (!guild || !member) return

    const reason = 'No reason provided (Quick Action)'

    if (!targetId) return interaction.editReply('Unable to mute at this time')

    const target = guild.members.cache.get(targetId) || await guild.members.fetch(targetId)
    if (!target) return interaction.editReply('Unable to mute at this time')

    if ((member as GuildMember).roles.highest.position <= target.roles.highest.position && member.user.id !== guild.ownerId) return interaction.editReply(`You don't have the required permissions to perform this action!`)

    new Mute({
      user: (member as GuildMember),
      target,
      reason,
      duration: 300000
    })

  }

}