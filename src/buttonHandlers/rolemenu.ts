import { ButtonHelp, GuildMember, HandlerProps } from 'discord.js'
import { IActionType, IRoleAction } from '../managers'
import { logger, formatDiff } from '../utils'

const help: ButtonHelp = {
  name: 'rolemenu',
  category: 'roles',
}

export class Rolemenu {

  public static async execute({
    client,
    interaction,
    args,
  }: HandlerProps) {

    if (!interaction.isButton()) return

    const { guild, member } = interaction

    const id = args.shift()

    if (!id || !guild || !member) return interaction.editReply('Unable to edit role at this time.').catch(e => {
      logger.debug(e.message)
    })

    const role = guild.roles.cache.get(id) || await guild.roles.fetch(id)

    if (!role) return interaction.editReply('Unable to edit role at this time.').catch(e => {
      logger.debug(e.message)
    })

    const count = client.roleManager.getQueueCount(guild.id)
    const message = count > 290 ? `A lot of members are currently requesting roles. I will edit your role in roughly ${formatDiff((Math.ceil(count / 10) * 10) * 1000)}.${count > 900 ? `If this takes more than 15 minutes, this interaction might fail but I should still edit your role after the estimated time!` : `I'll ping you when I have edited yours! Sit tight!`}` : `Editing your role. This may take a moment, please wait!`

    await interaction.editReply(message).catch(e => {
      logger.debug(e.message)
    })

    logger.debug([...(member as GuildMember).roles.cache.values()].map(r => r.name).join(' - '))
    const add = !((member as GuildMember).roles.cache.some(r => r.name.toLowerCase() === role.name.toLowerCase()))

    const early = () => {
      interaction.followUp({
        ephemeral: true,
        content: `Role ${role} was ${add ? 'assigned to' : 'removed from'} you!`
      })
      .catch(e => {
        logger.debug(e.message)
      })
    }

    const late = () => {
      interaction.followUp({
        ephemeral: true,
        content: `Hey ${member}! Role ${role} was ${add ? 'assigned to' : 'removed from'} you!`
      })
      .catch(e => {
        logger.debug(e.message)
      })
    }

    client.roleManager.add((member as GuildMember), role, add ? IRoleAction.ADD : IRoleAction.REMOVE, IActionType.MENU, count < 10 ? early : late)

  }

  public static get help() {
    return help
  }

}