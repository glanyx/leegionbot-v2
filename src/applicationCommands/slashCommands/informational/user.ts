import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'
import { User as UserClass } from '../../common'

const desc = 'Displays information about a user.'

const data = new SlashCommandBuilder()
  .setName('user')
  .setDescription(desc)
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('The user to get information for.')
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .setDMPermission(false)

export class User extends SlashCommand {

  static description = desc
  static data = data

  public static async run({
    client,
    interaction,
  }: SlashcommandInteractionArgs) {

    UserClass.run({
      client,
      interaction,
    })

  }
}