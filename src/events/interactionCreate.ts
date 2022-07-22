import { Client, Interaction } from 'discord.js'
import { ButtonHandlers } from '../buttonHandlers'

export class InteractionCreate {

  public static async execute(client: Client, interaction: Interaction) {

    if (interaction.isButton()) {
      const content = interaction.customId.split('-')
      const name =  content.shift()
      if (!name) return

      const handler = ButtonHandlers.find(item => item.name.toLowerCase() === name.toLowerCase())
      if (handler) {
        await interaction.deferReply()
        handler.execute({ client, interaction, args: content })
      }
    }

  }

}