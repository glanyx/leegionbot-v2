import { Client, CommandInteraction } from 'discord.js'

export interface ApplicationcommandInteractionArgs {
  client: Client,
  interaction: CommandInteraction
}

export abstract class ApplicationCommand {

  public static async run({ }: ApplicationcommandInteractionArgs): Promise<any> { }

}