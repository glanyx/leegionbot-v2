import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'
import { IActionType, IRoleAction } from '../../../managers/roleManager'
import { v4 as uuid } from 'uuid'

const desc = 'Temporary function to grant legacy role'

const data = new SlashCommandBuilder()
  .setName('rolesync')
  .setDescription(desc)
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

const roleIdArray = [
  '453583431637401610',
  '453583626958012448',
  '453583692540149771',
  '453583819132633089',
  '453583895070507019',
  '453583963806629909',
  '453584749173145601',
  '475090482360221697',
]

export class Rolesync extends SlashCommand {

  static description = desc
  static data = data

  public static async run({
    client,
    interaction
  }: SlashcommandInteractionArgs) {

    await interaction.deferReply()

    const { guild, channel } = interaction
    if (!guild) return interaction.editReply('You must use this command in a server.')

    await guild.members.fetch()
    await guild.roles.fetch()
    const legacyRole = guild.roles.cache.get('1151970542090465401')
    if (!legacyRole) return interaction.editReply('unable to find legacy role')

    const actionId = uuid()

    const legacyMembers = [...guild.members.cache.values()].filter(member => member.roles.cache.map(r => r.id).some(rid => roleIdArray.indexOf(rid) >= 0))

    const onComplete = () => {
      if (channel?.isTextBased()) channel.send('All Legacy roles assigned')
    }

    client.roleManager.addMultiple(legacyMembers, legacyRole, IRoleAction.ADD, IActionType.MANUAL, onComplete, actionId)

    interaction.editReply(`Now assigning legacy role to ${legacyMembers.length} users`)
  }

}