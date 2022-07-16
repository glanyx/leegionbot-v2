import { Client, Interaction } from 'discord.js'
import { ButtonHandlers } from '../buttonHandlers'

export class InteractionCreate {

  public static async execute(client: Client, interaction: Interaction) {

    if (interaction.isButton()) {
      const name = interaction.customId.split('-')[0]

      const handler = ButtonHandlers.find(item => item.name.toLowerCase() === name.toLowerCase())
      if (handler) handler.execute({ client, interaction })
    }

  }

}