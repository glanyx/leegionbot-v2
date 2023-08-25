import { ChatInputCommandInteraction, Client, ContextMenuCommandInteraction } from 'discord.js'

export interface ApplicationcommandInteractionArgs {
  client: Client,
  interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction
}

export abstract class ApplicationCommand {

  public static async run({ }: ApplicationcommandInteractionArgs): Promise<any> { }

}