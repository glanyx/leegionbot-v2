import { GuildMember } from 'discord.js'
import { ButtonHandler, HandlerProps } from './handler'
import { Rolegate as RolegateModel } from '../db/models'
import { IActionType, IRoleAction } from '../managers'

export class Rolegate extends ButtonHandler {

  public static async execute({
    client,
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

    const count = client.roleManager.getQueueCount(guild.id)
    const message = count > 300 ? `I'm giving out a lot of roles at the moment. This may take a few minutes, please do not request the role again. Sit tight!` : `Assigning your role. This may take a moment, please wait!`

    if (count > 10) {
      await interaction.reply({
        ephemeral: true,
        content: message,
      })
    }

    const early = interaction.reply({
      ephemeral: true,
      content: `Role ${role} was assigned to you!`
    })

    const late = interaction.followUp({
      ephemeral: true,
      content: `Role ${role} was assigned to you!`
    })

    client.roleManager.add((member as GuildMember), role, IRoleAction.ADD, IActionType.MENU, () => count < 10 ? early : late)

  }

}