import { GuildMember } from 'discord.js'
import { ButtonHandler, HandlerProps } from './handler'
import { Rolegate as RolegateModel } from '../db/models'

export class Rolegate extends ButtonHandler {

  public static async execute({
    interaction
  }: HandlerProps) {

    if (!interaction.isButton()) return

    const { guild, member } = interaction

    const name = interaction.customId
    const id = name.split('-').pop()

    if (!id || !guild || !member) return

    const gate = await RolegateModel.fetchById(parseInt(id))
    if (!gate) return

    const role = guild.roles.cache.get(gate.roleId) || await guild.roles.fetch(gate.roleId)

    if (!role) return

    (member as GuildMember).roles.add(role)

    interaction.reply({
      ephemeral: true,
      content: `Role ${role} was assigned to you!`
    })

  }

}