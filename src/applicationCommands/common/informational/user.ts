import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, GuildMember } from "discord.js"
import { format } from '../../../utils'
import { ApplicationcommandInteractionArgs } from '../applicationCommand'

interface UserSlashcommandInteractionArgs extends ApplicationcommandInteractionArgs {
  ephemeral?: boolean
  displayMenu?: boolean
}

enum PresenceStatus {
  dnd = 'Do Not Disturb',
  online = 'Online',
  idle = 'Idle',
  invisible = 'Invisible',
  offline = 'Offline'
}

const desc = 'Displays information about a user.'

export class User {

  static description = desc

  public static async run({
    interaction,
    ephemeral = false,
    displayMenu = false
  }: UserSlashcommandInteractionArgs) {

    await interaction.deferReply({ ephemeral })

    const { guild, member } = interaction
    if (!guild || !member) return

    const memberArgs = interaction.options.getMember('user') as GuildMember | null

    if (memberArgs) {

      const menu: Array<ActionRowBuilder<ButtonBuilder>> = []

      if (displayMenu) {
        const timeout = new ButtonBuilder()
          .setCustomId(`quicktimeout-${memberArgs.user.id}`)
          .setLabel('Timeout (5m)')
          .setStyle(ButtonStyle.Primary)

        const kick = new ButtonBuilder()
          .setCustomId(`quickkick-${memberArgs.user.id}`)
          .setLabel('Kick')
          .setStyle(ButtonStyle.Danger)

        const ban = new ButtonBuilder()
          .setCustomId(`quickban-${memberArgs.user.id}`)
          .setLabel('Ban')
          .setStyle(ButtonStyle.Danger)

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(timeout, kick, ban)

        menu.push(row)
      }

      interaction.editReply({ embeds: [getEmbed((memberArgs as GuildMember))], components: menu })
      return
    }
    interaction.editReply({ embeds: [getEmbed((member as GuildMember))] })

  }
}


const getEmbed = (member: GuildMember) => {

  const roleString = member.roles.cache.size > 1 ? member.roles.cache
    .sort((roleA, roleB) => roleB.position - roleA.position)
    .map(role => {
      if (role.name !== "@everyone") {
        return `${role}`
      }
    }).join('\n') : '*None*'

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
