import { Client, GuildMember, Role, Message, EmbedBuilder, User, TextChannel, GuildChannel, Colors } from 'discord.js'
import { GuildSetting, ModLog, ModeratorAction } from '../db/models'
import { formatDiff } from '../utils'
import logger from './logger'

const MuteMap = new Map<number, IMemberMute>()
const GuildMap = new Map<string, IGuildAutoMute>()

interface IMemberMute {
  member: GuildMember,
  role: Role,
  timeout: NodeJS.Timeout
}

interface IGuildAutoMute {
  messageLimit: number
  messageTimeframe: number
  muteDuration: number
  mutedRole: Role
  members: Map<string, IMemberMessages>
  logChannelId?: string
}

interface IMemberMessages {
  messages: Map<string, IMessageMap>
}

interface IMessageMap {
  message: Message,
  timeout: NodeJS.Timeout
}

export class MuteManager {

  public static add(id: number, member: GuildMember, role: Role, time: number) {

    const now = Date.now()
    const diff = time - now

    const timeout = setTimeout(() => {
      this.dispose(id)
    }, diff)

    MuteMap.set(id, {
      member,
      role,
      timeout
    })
  }

  public static async dispose(id: number, user?: User) {

    const mute = MuteMap.get(id)
    if (!mute) return

    logger.debug(`Unmuting User ID ${mute.member.id} in Guild ID ${mute.member.guild.id}.`)

    mute.member.roles.remove(mute.role).catch(e => {
      logger.error(`Unable to remove mutedrole (ID: ${mute.role.id}) from User ID ${mute.member.id}`)
    })
    ModLog.fetchById(id).then(action => {
      if (!action) return
      action.unmute().update()
    })

    let success = true
    mute.member.send(`Your mute in **${mute.member.guild.name}** has ended or has been rescinded by a moderator!`).catch(e => {
      success = false
      logger.warn(`Couldn't DM user ${mute.member.id} regarding unmute in Guild ${mute.member.guild.id}`)
    })

    const guild = mute.member.guild
    const settings = await GuildSetting.fetchByGuildId(guild.id)
    if (!settings) return

    const { modLogChannelId } = settings
    if (!modLogChannelId) return

    const ch = guild.channels.cache.get(modLogChannelId) as TextChannel
    if (!ch) return
    await ch.fetch()

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${mute.member.user.username}#${mute.member.user.discriminator} [ID: ${mute.member.user.id}]`,
        iconURL: mute.member.user.avatarURL() || undefined
      })
      .setTitle(`ID ${id} | Unmute`)
      .setDescription(`This user has been unmuted.`)
      .addFields({
        name: 'User',
        value: `${mute.member}`,
        inline: true
      }, {
        name: 'Actioned by',
        value: user ? `${user}` : 'Auto unmute',
        inline: true,
      }, {
        name: 'Received DM?',
        value: success ? 'Yes' : 'No',
      })
      .setTimestamp()
      .setColor('#00ff00')

    ch.send({ embeds: [embed] })

    clearTimeout(mute.timeout)
    MuteMap.delete(id)
  }

  public static silentDispose(id: number) {
    const mute = MuteMap.get(id)
    if (!mute) return
    clearTimeout(mute.timeout)
    MuteMap.delete(id)
  }

}

// export class AutoMod {

//   public static async add (client: Client, member: GuildMember, message: Message) {

//     const { guild } = member

//     if (!GuildMap.has(member.guild.id)) {
//       const settings = await GuildSetting.fetchByGuildId(guild.id)
//       if (!settings) return
//       const { messageLimit, messageTimeframe, muteDuration, mutedRoleId, messageLogChannelId } = settings
//       if (!messageLimit || !messageTimeframe || !muteDuration) return
//       const role = guild.roles.cache.get(mutedRoleId)

//       if (!role) return

//       GuildMap.set(guild.id, {
//         messageLimit,
//         messageTimeframe,
//         muteDuration,
//         mutedRole: role,
//         members: new Map<string, IMemberMessages>(),
//         logChannelId: messageLogChannelId,
//       })
//     }

//     const { messageLimit, messageTimeframe, muteDuration, members, logChannelId } = GuildMap.get(guild.id) as IGuildAutoMute

//     if (!members.has(member.id)) {
//       members.set(member.id, {
//         messages: new Map<string, IMessageMap>()
//       })
//     }

//     const memberMap = members.get(member.id) as IMemberMessages
//     const { messages } = memberMap

//     if (memberMap.messages.size + 1 >= messageLimit) {

//       const arr: Array<Message> = []
//       messages.forEach(msg => {
//         arr.push(msg.message)
//       });
//       arr.push(message);

//       (message.channel as TextChannel).bulkDelete(arr)

//       if (logChannelId) {
//         const ch = guild.channels.cache.get(logChannelId) as TextChannel
//         if (!ch) return
//         await ch.fetch()

//         const embed = new MessageEmbed()
//           .setColor('#ff0000')
//           .setAuthor(`${message.author.username || 'Unknown'}#${message.author.discriminator || '0000'}`, message.author.avatarURL() || undefined)
//           .setTitle(`Message Bulk Delete`)
//           .addField('Channel', `<#${message.channel.id}>` || 'Unable to retrieve', true)
//           .addField('Author', `<@${message.author.id}>` || 'Unable to retrieve', true)
//           .setTimestamp()

//         arr.forEach((msg, index) => {
//           embed.addField(`Message ${index + 1}`, msg.content)
//         })

//         ch.send({ embeds: [embed] })
//       }

//       // Limit reached, mute member
//       const muteTime = Date.now() + muteDuration
//       const reason = 'Muted by AutoMod'
//       const muteAction = await handleUserMute(member, reason, muteDuration)
//       if (!muteAction) return
//       const { role, success } = muteAction

//       if (!role) return

//       const embed = new MessageEmbed()
//         .setAuthor(`${member.user.username}#${member.user.discriminator} [ID: ${member.user.id}]`, member.user.avatarURL() || undefined)
//         .setDescription(`This user has been muted.`)
//         .addField('User', `<@${member.id}>`, true)
//         .addField('Actioned by', `<@${client.user?.id}>`, true)
//         .addField('Reason', reason)
//         .addField('Received DM?', `${success ? 'Yes' : 'No'}`)
//         .setTimestamp()
//         .setColor('#FFA500')

//       if (!client.user) return

//       ModLog.storeNewAction({
//         guildId: guild.id,
//         userId: client.user?.id,
//         targetId: member.user.id,
//         action: ModeratorAction.MUTE,
//         reason,
//         muteTime: new Date(muteTime)
//       }).then(action => {
//         embed.setTitle(`ID ${action.id} | Mute`)
//         MuteManager.add(action.id, member, role, muteTime)
//       }).catch(e => {
//         const text = `Unable to store \`mute\` action for User ID ${member.user.id}!`
//         logger.error(`${text}\n${e}`)
//       })

//       const settings = await GuildSetting.fetchByGuildId(guild.id)
//       if (!settings) return

//       const { modLogChannelId } = settings
//       if (!modLogChannelId) return
//       const ch = guild.channels.cache.get(modLogChannelId) as TextChannel
//       if (!ch) return
//       await ch.fetch()

//       ch.send({ embeds: [embed] })

//     } else {
//       const timeout = setTimeout(() => {
//         messages.delete(message.id)
//         if (messages.size === 0) members.delete(member.id)
//         clearTimeout(timeout)
//       }, messageTimeframe)

//       messages.set(message.id, {
//         message,
//         timeout
//       })
//     }

//   }

// }

export const handleUserMute = async (member: GuildMember, reason: string, duration: number) => {

  const { guild } = member

  const settings = await GuildSetting.fetchByGuildId(guild.id)
  if (!settings) return
  const { mutedRoleId: roleId, alertOnAction } = settings
  let role = guild.roles.cache.get(roleId)

  if (!role) {
    // Create a new role
    const newRole = await guild.roles.create({
      name: 'Muted',
      color: Colors.Red,
      permissions: [],
      reason: 'Automated Role Creation'
    })

    guild.channels.cache.map(async channel => {
      await channel.fetch()

      newRole && (channel as GuildChannel).permissionOverwrites.create(newRole, {
        SendMessages: false,
        AttachFiles: false,
        AddReactions: false,
        Speak: false
      })
    })

    GuildSetting.fetchByGuildId(guild.id).then(settings => {
      if (!settings) return
      settings.setMutedRole(newRole.id).update().then(() => {
        role = newRole
      }).catch(e => {
        const text = `Unable to store mute role settings for Server ID ${guild.id}!`
        logger.error(`${text}\n${e}`)
      })
    }).catch(e => {
      const text = `Unable to store mute role settings for Server ID ${guild.id}!`
      logger.error(`${text}\n${e}`)
    })
  }

  if (!role) return
  member.roles.add(role)

  const embed = new EmbedBuilder()
    .setTitle('Muted!')
    .setColor('#FFA500')
    .setDescription(`You were muted in the \`${guild.name}\` Discord server!`)
    .addFields({
      name: 'Reason',
      value: reason,
      inline: true,
    }, {
      name: 'Duration',
      value: formatDiff(duration),
      inline: true,
    })

  let success = false
  if (alertOnAction) {
    try {
      await member.send({ embeds: [embed] })
      success = true
    } catch (e: any) {
      logger.error(`${e.message} - User ID: ${member.user.id}`)
    }
  }

  return { role, success }

}