import { Client, Interaction } from 'discord.js'
import { ButtonHandlers } from '../buttonHandlers'
import { SlashCommands } from '../slashCommandHandlers'
import { logger } from '../utils'

export class InteractionCreate {

  public static async execute(client: Client, interaction: Interaction) {

    if (interaction.isButton()) {

      const content = interaction.customId.split('-')
      const name =  content.shift()
      if (!name) return

      const handler = ButtonHandlers.find(item => item.help.name.toCamelCase() === name.toLowerCase())
      if (!handler) return

      const { guild, user } = interaction
      logger.info(`Executing Button ${name} | Guild ID ${guild?.id} | User ID ${user.id}`)
      await interaction.deferReply({ ephemeral: true })
      handler.execute({ client, interaction, args: content })

    } else if (interaction.isCommand()) {

      const content = interaction.commandName.split('-')
      const name =  content.shift()
      if (!name) return

      const cmd = SlashCommands.find(item => item.help.name.toCamelCase() === this.name.toLowerCase())
      if (!cmd) return

      const { guild, user } = interaction
      logger.info(`Executing SlashCommand ${name} | Guild ID ${guild?.id} | User ID ${user.id}`)
      await interaction.deferReply({ ephemeral: true })
      cmd.execute({ client, interaction })
    }

  }

}