import { EmbedBuilder, GuildMember, TextChannel, PermissionFlagsBits } from "discord.js"
import { format, logger } from '../../utils'
import { SlashCommandBuilder } from '@discordjs/builders'
import { SlashCommand, SlashcommandInteractionArgs } from '../slashCommand'

enum PresenceStatus {
  dnd = 'Do Not Disturb',
  online = 'Online',
  idle = 'Idle',
  invisible = 'Invisible',
  offline = 'Offline'
}

const desc = 'Displays information about a user.'

const data = new SlashCommandBuilder()
  .setName('user')
  .setDescription(desc)
  .addUserOption(option =>
    option
      .setName('user')
      .setDescription('The user to get information for.')
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
  .setDMPermission(false)

export class User extends SlashCommand {

  static description = desc
  static data = data

  public static async run({
    interaction,
  }: SlashcommandInteractionArgs) {

    await interaction.deferReply()

    const { guild, member } = interaction
    if (!guild || !member) return

    const memberArgs = interaction.options.getMember('user')

    if (memberArgs) {
      interaction.editReply({ embeds: [getEmbed((memberArgs as GuildMember))] })
      return
    }
    interaction.editReply({ embeds: [getEmbed((member as GuildMember))] })

  }
}

const getEmbed = (member: GuildMember) => {

  const everyone = member.guild.roles.everyone
  const roleString = member.roles.cache.size > 1 ? member.roles.cache
    .filter(r => !r.name.includes('⁣') && r.id !== everyone.id)
    .sort((roleA, roleB) => roleB.position - roleA.position)
    .map(r => r)
    .join() : '*None*'

  const defaultImage = 'https://discord.com/assets/6debd47ed13483642cf09e832ed0bc1b.png'

  const embed = new EmbedBuilder()
    .setAuthor({
      name: member.user.tag,
      iconURL: member.user.avatarURL() || defaultImage
    })
    .setDescription(`${member.user}`)
    .setThumbnail(member.user.avatarURL() || defaultImage)
    .setColor(member.roles.highest.color)
    .setTimestamp()
    .setFooter({ text: `${member.user.username} | ID: ${member.user.id}` })
    .addFields({
      name: 'User',
      value: `${member.user.username}`,
      inline: true,
    }, {
      name: 'Nickname',
      value: member.nickname || '*None*',
      inline: true,
    }, {
      name: 'User ID',
      value: member.user.id,
      inline: true,
    }, {
      name: 'Status',
      value: member.presence ? PresenceStatus[member.presence.status] : 'Unknown',
      inline: true,
    }, {
      name: 'Creation Date',
      value: format(member.user.createdAt),
      inline: true,
    }, {
      name: 'Join Date',
      value: member.joinedAt ? format(member.joinedAt) : 'Unknown',
      inline: true,
    }, {
      name: 'Roles',
      value: roleString,
      inline: true,
    })

  return embed
}
