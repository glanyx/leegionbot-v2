import { Client, ContextMenuCommandBuilder, UserContextMenuCommandInteraction } from 'discord.js'
import { CommandLevel } from '../../utils/constants'

export interface UserContextMenuInteractionArgs {
  client: Client,
  interaction: UserContextMenuCommandInteraction
}

const desc = ''
const data: ContextMenuCommandBuilder = new ContextMenuCommandBuilder()

export abstract class UserContextMenu {

  static description = desc
  static data = data
  static level = CommandLevel.GLOBAL

  public static async run({ }: UserContextMenuInteractionArgs): Promise<any> { }

}