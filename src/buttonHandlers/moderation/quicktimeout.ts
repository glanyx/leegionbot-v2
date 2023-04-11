import { GuildMember, User } from 'discord.js'
import { ButtonHandler, HandlerProps } from '../handler'
import { ModActions } from "../../utils"

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

    const targetMember = guild.members.cache.get(targetId) || await guild.members.fetch(targetId)
    if (!targetMember) return interaction.editReply('Unable to mute at this time')

    if ((member as GuildMember).roles.highest.position <= targetMember.roles.highest.position && member.user.id !== guild.ownerId) return interaction.editReply(`You don't have the required permissions to perform this action!`)

    ModActions.mute(targetMember, reason, (member.user as User), 300000)

  }

}