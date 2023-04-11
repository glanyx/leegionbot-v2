import { Client, CommandInteraction, ContextMenuCommandBuilder } from 'discord.js'
import { CommandLevel } from '../../utils/constants'

export interface ContextMenuInteractionArgs {
  client: Client,
  interaction: CommandInteraction
}

const desc = ''
const data: ContextMenuCommandBuilder = new ContextMenuCommandBuilder()

export abstract class ContextMenu {

  static description = desc
  static data = data
  static level = CommandLevel.GLOBAL

  public static async run({ }: ContextMenuInteractionArgs): Promise<any> { }

}