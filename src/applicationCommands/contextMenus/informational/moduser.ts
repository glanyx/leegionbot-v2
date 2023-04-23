import { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } from "discord.js"
import { ContextMenu, ContextMenuInteractionArgs } from '../contextMenu'
import { User as UserClass } from '../../common'

const desc = 'Displays information about a user.'

const data = new ContextMenuCommandBuilder()
  .setName('modUser')
  .setType(ApplicationCommandType.User)
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .setNameLocalizations({
    "en-GB": 'User Info (Mod)',
    "en-US": 'User Info (Mod)'
  })

export class ModUser extends ContextMenu {

  static description = desc
  static data = data

  public static async run({
    interaction,
    client
  }: ContextMenuInteractionArgs) {

    UserClass.run({
      client,
      interaction,
      ephemeral: true,
      displayMenu: true,
    })

  }
}