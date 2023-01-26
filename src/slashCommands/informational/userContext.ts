import { GuildMember, ContextMenuCommandBuilder, ApplicationCommandType } from "discord.js"
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'
import { User } from './user'

const desc = 'Displays information about a user.'

const data = new ContextMenuCommandBuilder()
  .setName('userContext')
  .setType(ApplicationCommandType.User)
  .setNameLocalizations({
    "en-GB": 'User Info',
    "en-US": 'User Info'
  })

export class UserContext extends SlashCommand {

  static description = desc
  static data = data

  public static async run({
    interaction,
    client
  }: SlashcommandInteractionArgs) {

    User.run({
      client,
      interaction,
      ephemeral: true
    })

  }
}