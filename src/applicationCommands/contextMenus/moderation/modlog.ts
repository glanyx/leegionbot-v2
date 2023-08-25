import { CommandInteraction, ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits, GuildMember, User } from 'discord.js'
import { ContextMenu, ContextMenuInteractionArgs } from '../contextMenu'
import { ModLog } from '../../../db/models'
import { Paginator } from '../../../utils'

const desc = 'Checks moderation logs for a user.'

const data = new ContextMenuCommandBuilder()
  .setName('modlog')
  .setType(ApplicationCommandType.User)
  .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
  .setNameLocalizations({
    "en-GB": 'Mod Log',
    "en-US": 'Mod Log'
  })

export class Modlog extends ContextMenu {

  static description = desc
  static data = data

  public static async execute({
    interaction,
  }: ContextMenuInteractionArgs) {

    if (!interaction.inGuild()) return

    const { targetMember, member } = interaction

    if (!targetMember) return interaction.editReply('Unable to ban at this time')

    sendPaginator((targetMember as GuildMember), interaction, (member as GuildMember).user)

  }

}

const sendPaginator = async (member: GuildMember, interaction: CommandInteraction, author: User) => {

  const { guild } = member

  const { items: logs } = await ModLog.fetchByUserId(guild.id, member.id)

  if (logs.length === 0) return interaction.editReply(`No logs found for User ${member}`)

  new Paginator(interaction, {
    author: author,
    items: await Promise.all(logs.map(async item => `**Action:** ${item.action}\n**Actioned by:** ${(await guild.members.cache.get(item.userId)?.fetch())}\n**When:** ${item.time}\n**Reason:** ${item.reason}\n\n`)),
    timeout: 60000
  })

}