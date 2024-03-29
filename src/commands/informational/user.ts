import { Help, Config, IExecuteArgs, EmbedBuilder, GuildMember, TextChannel } from "discord.js"
import { format, logger } from '../../utils'

enum PresenceStatus {
  dnd = 'Do Not Disturb',
  online = 'Online',
  idle = 'Idle',
  invisible = 'Invisible',
  offline = 'Offline'
}

const help: Help = {
  name: "user",
  category: "Informational",
  description: "Displays information about a user.",
  usage: "user (@user | UserID)",
  example: [
    'user',
    'user @User',
    'user 1234567890'
  ]
}

const configs: Config = {

}

export class User {

  public static async run({
    message,
    args
  }: IExecuteArgs) {

    const { guild, member, channel } = message
    if (!guild || !member) return

    if (args.length > 0) {
      args.forEach(async arg => {
        let foundMember
        if (arg.match(/^<@[0-9]*>$/g)) {
          foundMember = guild.members.cache.get(arg.substring(2, arg.length - 1))
        } else if (arg.match(/^<@![0-9]*>$/g)) {
          foundMember = guild.members.cache.get(arg.substring(3, arg.length - 1))
        } else {
          foundMember = await guild.members.fetch(arg).catch(() => {
            logger.debug(`Unable to find member for arguments ${arg} in Guild ID ${guild.id}`)
          })
        }
        if (!foundMember) return (channel as any).send(`Unable to find member for arguments ${arg}`)
        sendEmbed(foundMember, (channel as TextChannel))
      })
    } else {
      sendEmbed(member, (channel as TextChannel))
    }

  }

  public static get help() {
    return help
  }

  public static get configs() {
    return configs
  }

}


const sendEmbed = (member: GuildMember, channel: TextChannel) => {

  const roleString = member.roles.cache.size > 1 ? member.roles.cache.map(role => {
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

  channel.send({ embeds: [embed] })

}
