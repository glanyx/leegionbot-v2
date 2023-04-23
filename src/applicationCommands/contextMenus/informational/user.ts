import { ContextMenuCommandBuilder, ApplicationCommandType } from "discord.js"
import { ContextMenu, ContextMenuInteractionArgs } from '../contextMenu'
import { User as UserClass } from '../../common'

const desc = 'Displays information about a user.'

const data = new ContextMenuCommandBuilder()
  .setName('user')
  .setType(ApplicationCommandType.User)
  .setNameLocalizations({
    "en-GB": 'User Info',
    "en-US": 'User Info'
  })

export class User extends ContextMenu {

  static description = desc
  static data = data

  public static async run({
    interaction,
    client
  }: ContextMenuInteractionArgs) {

    UserClass.run({
      client,
      interaction,
      ephemeral: true
    })

  }
}