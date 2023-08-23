import { SlashCommandBuilder } from 'discord.js'
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'
import axios from 'axios'
import { logger } from '../../../utils'

interface WyrResponse {
  data: Array<{
    question: string
  }>
}

const desc = 'Asks a random Would You Rather question.'

const data = new SlashCommandBuilder()
  .setName('wyr')
  .setDescription(desc)
  .setDMPermission(true)

export class Wyr extends SlashCommand {

  static description = desc
  static data = data

  public static async run({
    client,
    interaction
  }: SlashcommandInteractionArgs) {

    await interaction.deferReply()

    axios({
      method: 'GET',
      url: 'https://would-you-rather.p.rapidapi.com/wyr/random',
      headers: {
        'X-RapidAPI-Key': `${process.env.RAPID_API_KEY}`,
        'X-RapidAPI-Host': 'would-you-rather.p.rapidapi.com',
      }
    }).then(({ data }: WyrResponse) => {
      interaction.editReply(data[0].question)
    }).catch(e => {
      logger.debug(`Wyr error: ${e.message}`)
      interaction.editReply(`Unable to fetch question at this time. :(`)
    })

  }

}