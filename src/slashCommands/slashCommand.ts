import { Client, CommandInteraction } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandLevel } from '../utils/constants'

export interface SlashcommandInteractionArgs {
  client: Client,
  interaction: CommandInteraction
}

const desc = ''
const data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> = new SlashCommandBuilder()

export abstract class SlashCommand {

  static description = desc
  static data = data
  static level = CommandLevel.GLOBAL

  public static async run({ }: SlashcommandInteractionArgs): Promise<any> { }

}