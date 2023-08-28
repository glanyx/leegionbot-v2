import { CommandInteraction, GuildMember, PermissionFlagsBits, SlashCommandBuilder, User } from "discord.js"
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'
import { ModLog } from "../../../db/models"
import { Paginator } from "../../../utils"

const desc = 'Checks moderation logs for a user.'

const data = new SlashCommandBuilder()
  .setName('modlog')
  .setDescription(desc)
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('The user to check logs for.')
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
  .setDMPermission(false)

export class Modlog extends SlashCommand {

  static description = desc
  static data = data

  public static async run({
    interaction,
  }: SlashcommandInteractionArgs) {

    await interaction.deferReply({ ephemeral: true })

    const { user, guild } = interaction

    if (!user || !guild) return

    const target = interaction.options.getMember('user') as GuildMember | null

    if (!target) return interaction.editReply('Unable to find logs for user at this time. Please try again later.')

    sendPaginator(target, interaction, user)
  }
}

const sendPaginator = async (member: GuildMember, interaction: CommandInteraction, author: User) => {

  const { guild } = member

  const { items: logs } = await ModLog.fetchByUserId(guild.id, member.id)

  if (logs.length === 0) return interaction.editReply(`No logs found for User ${member}`)

  new Paginator(interaction, {
    author: author,
    items: await Promise.all(logs.map(async item => `**Action:** ${item.action}\n**Actioned by:** ${(await guild.members.cache.get(item.userId)?.fetch())}\n**When:** <t:${Math.round(item.time.getTime()) / 1000}>\n**Reason:** ${item.reason}\n\n`)),
    timeout: 60000
  })

}