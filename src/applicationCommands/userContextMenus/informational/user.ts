import { ContextMenuCommandBuilder, ApplicationCommandType } from "discord.js"
import { UserContextMenu, UserContextMenuInteractionArgs } from '../userContextMenu'
import { User as UserClass } from '../../common'

const desc = 'Displays information about a user.'

const data = new ContextMenuCommandBuilder()
  .setName('user')
  .setType(ApplicationCommandType.User)
  .setNameLocalizations({
    "en-GB": 'User Info',
    "en-US": 'User Info'
  })

export class User extends UserContextMenu {

  static description = desc
  static data = data

  public static async run({
    interaction,
    client
  }: UserContextMenuInteractionArgs) {

    UserClass.run({
      client,
      interaction,
      ephemeral: true
    })

  }
}