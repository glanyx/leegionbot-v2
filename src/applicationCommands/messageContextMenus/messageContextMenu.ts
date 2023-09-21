import { Client, ContextMenuCommandBuilder, MessageContextMenuCommandInteraction } from 'discord.js'
import { CommandLevel } from '../../utils/constants'

export interface MessageContextMenuInteractionArgs {
  client: Client,
  interaction: MessageContextMenuCommandInteraction
}

const desc = ''
const data: ContextMenuCommandBuilder = new ContextMenuCommandBuilder()

export abstract class MessageContextMenu {

  static description = desc
  static data = data
  static level = CommandLevel.GLOBAL

  public static async run({ }: MessageContextMenuInteractionArgs): Promise<any> { }

}