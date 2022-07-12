import { Client, Interaction } from 'discord.js'
import { ButtonHandlers } from '../buttonHandlers'

export class InteractionCreate {

  public static async execute(client: Client, interaction: Interaction) {

    if (interaction.isButton()) {
        const name = interaction.customId

        const handler = ButtonHandlers.find(item => item.name)
        if (handler) handler.execute({ client, interaction })
    }

  }

}