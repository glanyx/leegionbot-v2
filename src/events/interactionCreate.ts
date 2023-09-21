import { Client, Interaction } from 'discord.js'
import SlashCommands from '../applicationCommands/slashCommands'
import UserContextMenus from '../applicationCommands/userContextMenus'
import MessageContextMenus from '../applicationCommands/messageContextMenus'
import { ButtonHandlers } from '../buttonHandlers'
import { logger } from '../utils'

export class InteractionCreate {

  public static async execute(client: Client, interaction: Interaction) {

    if (interaction.isButton()) {
      const content = interaction.customId.split('-')
      const name = content.shift()
      if (!name) return

      const handler = ButtonHandlers.find(item => item.name.toLowerCase() === name.toLowerCase())
      if (handler) {
        const { guild, user } = interaction
        logger.info(`Executing Button ${name} | Guild ID ${guild?.id} | User ID ${user.id}`)
        await interaction.deferReply({ ephemeral: true })
        handler.execute({ client, interaction, args: content })
      }
      return
    }

    if (interaction.isChatInputCommand()) {

      const command = interaction.commandName.toCamelCase()
      if (!command) return

      const cmd = SlashCommands.find(acmd => acmd.name.toCamelCase() === command)

      if (!cmd) return

      logger.debug(`SlashCommand : ${cmd.name} executed by ${interaction.user.username}#${interaction.user.discriminator} (ID: ${interaction.user.id})`)

      cmd.run({ client, interaction })

    }

    if (interaction.isUserContextMenuCommand()) {

      const command = interaction.commandName.toCamelCase()
      if (!command) return

      const cmd = UserContextMenus.find(cm => cm.name.toCamelCase() === command || cm.name.toCamelCase() === `${command}Context`)

      if (!cmd) return

      logger.debug(`UserContextMenu : ${cmd.name} executed by ${interaction.user.username}#${interaction.user.discriminator} (ID: ${interaction.user.id})`)

      cmd.run({ client, interaction })

    }

    if (interaction.isMessageContextMenuCommand()) {
      
      const command = interaction.commandName.toCamelCase()
      if (!command) return

      const cmd = MessageContextMenus.find(cm => cm.name.toCamelCase() === command || cm.name.toCamelCase() === `${command}Context`)

      if (!cmd) return

      logger.debug(`MessageContextMenu : ${cmd.name} executed by ${interaction.user.username}#${interaction.user.discriminator} (ID: ${interaction.user.id})`)

      cmd.run({ client, interaction })

    }

  }

}