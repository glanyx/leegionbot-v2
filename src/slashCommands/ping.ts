import { SlashCommandBuilder } from '@discordjs/builders'
import { SlashCommand, SlashcommandInteractionArgs } from './slashCommand'

const desc = 'Ping!'

const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription(desc)

export class Ping extends SlashCommand {

  static description = desc
  static data = data

  public static async run({
    interaction
  }: SlashcommandInteractionArgs) {

    if (!interaction.isCommand()) return

    interaction.reply('Pong!')

  }

}