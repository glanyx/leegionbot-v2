import { SlashCommandBuilder } from 'discord.js'
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'
import axios from 'axios'
import { logger } from '../../../utils'

interface JokeResponse {
  data: {
    id: string
    joke: string
    status: number
  }
}

const desc = 'Tells a random dadjoke.'

const data = new SlashCommandBuilder()
  .setName('dadjoke')
  .setDescription(desc)
  .setDMPermission(true)

export class Dadjoke extends SlashCommand {

  static description = desc
  static data = data

  public static async run({
    client,
    interaction
  }: SlashcommandInteractionArgs) {

    await interaction.deferReply()

    axios({
      method: 'GET',
      url: 'https://icanhazdadjoke.com',
      headers: {
        'Accept': 'application/json'
      }
    }).then(({ data }: JokeResponse) => {
      interaction.editReply(data.joke)
    }).catch(e => {
      logger.debug(`Dadjoke error: ${e.message}`)
      interaction.editReply(`Unable to fetch dadjoke at this time. :(`)
    })

  }

}