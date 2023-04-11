import { ContextMenuCommandBuilder, ApplicationCommandType } from "discord.js"
import { ContextMenu, ContextMenuInteractionArgs } from '../contextMenu'
import { User } from '../../slashCommands/informational'

const desc = 'Displays information about a user.'

const data = new ContextMenuCommandBuilder()
  .setName('user')
  .setType(ApplicationCommandType.User)
  .setNameLocalizations({
    "en-GB": 'User Info',
    "en-US": 'User Info'
  })

export class UserContext extends ContextMenu {

  static description = desc
  static data = data

  public static async run({
    interaction,
    client
  }: ContextMenuInteractionArgs) {

    User.run({
      client,
      interaction,
      ephemeral: true
    })

  }
}