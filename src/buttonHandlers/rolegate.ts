import { GuildMember } from 'discord.js'
import { ButtonHandler, HandlerProps } from './handler'
import { Rolegate as RolegateModel } from '../db/models'
import { IActionType, IRoleAction } from '../managers'
import { logger, formatDiff } from '../utils'

export class Rolegate extends ButtonHandler {

  public static async execute({
    client,
    interaction,
    args,
  }: HandlerProps) {

    if (!interaction.isButton()) return

    const { guild, member } = interaction

    const id = args.shift()

    if (!id || !guild || !member) return interaction.followUp('Unable to assign role at this time.')

    const role = guild.roles.cache.get(id) || await guild.roles.fetch(id)

    if (!role) return interaction.reply('Unable to assign role at this time.')

    const count = client.roleManager.getQueueCount(guild.id)
    const message = count > 290 ? `A lot of members are currently requesting roles. I will assign your role in roughly ${formatDiff((Math.ceil(count / 10) * 10) * 1000)}.${count > 900 ? `If this takes more than 15 minutes, this interaction might fail but you should still get your role after the estimated time!` : `I'll ping you when you have yours! Sit tight!`}` : `Assigning your role. This may take a moment, please wait!`

    if (count >= 10) {
      await interaction.followUp({
        ephemeral: true,
        content: message,
      })
    }

    const early = interaction.followUp({
      ephemeral: true,
      content: `Role ${role} was assigned to you!`
    })

    const late = interaction.followUp({
      ephemeral: true,
      content: `Hey ${member}! Role ${role} was assigned to you!`
    })
    .catch(e => logger.debug(e.message))

    client.roleManager.add((member as GuildMember), role, IRoleAction.ADD, IActionType.MENU, () => count < 10 ? early : late)

  }

}