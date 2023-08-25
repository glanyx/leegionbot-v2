import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from 'discord.js'
import { CommandLevel } from '../../utils/constants'

export interface SlashcommandInteractionArgs {
  client: Client,
  interaction: ChatInputCommandInteraction
}

const desc = ''
const data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> = new SlashCommandBuilder()

export abstract class SlashCommand {

  static description = desc
  static data = data
  static level = CommandLevel.GLOBAL

  public static async run({ }: SlashcommandInteractionArgs): Promise<any> { }

}