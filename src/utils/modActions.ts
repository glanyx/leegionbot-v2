import { Client, EmbedBuilder, Guild, GuildMember, GuildChannel, TextChannel, User, Role, ChannelType, Colors } from 'discord.js'
import { ModLog, ModeratorAction, GuildSetting } from '../db/models'
import { logger, formatDiff } from '.'

interface GuildMapInterface {
  guild: Guild
  mutedRole: Role
  mutes: Map<string, MuteMapInterface>
}

interface MuteMapInterface {
  member: GuildMember
  data?: ModLog
  endDatetime: number 
}

const GuildMap = new Map<string, GuildMapInterface>()

export class ModActions {

  public static monitorMutes = () => {

    setInterval(() => {
      const now = Date.now()
      GuildMap.forEach(guild => {
        guild.mutes.forEach(mute => {
          if (mute.endDatetime < now) {
            ModActions.unmute(mute.member, mute.data)
            guild.mutes.delete(mute.member.id)
            if (guild.mutes.size <= 0) GuildMap.delete(guild.guild.id)
          }
        })
      })
    }, 5000)
    
  }

  public static warn = async (member: GuildMember, sourceChannel: GuildChannel, reason: string, user: User) => {

    const { guild } = member
    const settings = await ModActions.fetchGuildSettings(guild.id)
    if (!settings) return

    const { modLogChannelId } = settings
    const logChannel = guild.channels.cache.get(modLogChannelId) || await guild.channels.fetch(modLogChannelId)

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${member.user.username}#${member.user.discriminator} [ID: ${member.user.id}]`, iconURL: member.user.displayAvatarURL() })
      .setDescription(`This user has been warned.`)
      .addFields({
        name: 'User',
        value: `${member}`,
        inline: true,
      }, {
        name: 'Actioned by',
        value: `${user}`,
        inline: true,
      }, {
        name: 'Reason',
        value: reason,
      })
      .setTimestamp()
      .setColor('#FFA500')

    const msg = await ModActions.notifyUser(member.user, `You were warned in the \`${guild.name}\` Discord server for the following reason:\n${reason}`).catch(_ => { return undefined })
    embed.addFields({
      name: 'Received DM?',
      value: msg ? 'Yes' : 'No'
    })

    ModActions.saveToDb(guild.id, user.id, member.id, ModeratorAction.WARN, reason)
      .then((action) => {
        embed.setTitle(`ID ${action.id} | Warn`)
      })
      .catch(err => {
        logger.error(`Error saving warn to DB\n${err.message}`)
        
        embed.setTitle(`ID *Unknown* | Warn`)
        embed.addFields({
          name: 'Error',
          value: 'Member was warned, however there was an error saving this data.'
        })
      })
      .finally(() => {
        if (logChannel && logChannel.type === ChannelType.GuildText) ModActions.notifyGuild(logChannel, embed, (sourceChannel as TextChannel))
      })
  }

  public static kick = async (member: GuildMember, sourceChannel: GuildChannel, reason: string, user: User) => {

    const { guild } = member
    const settings = await ModActions.fetchGuildSettings(guild.id)
    if (!settings) return

    if (!member.kickable) {
      if (sourceChannel.type === ChannelType.GuildText) (sourceChannel as TextChannel).send('Unable to kick user.')
      return
    }

    const { modLogChannelId } = settings
    const logChannel = guild.channels.cache.get(modLogChannelId) || await guild.channels.fetch(modLogChannelId)

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${member.user.username}#${member.user.discriminator} [ID: ${member.user.id}]`, iconURL: member.user.displayAvatarURL() })
      .setDescription(`This user has been kicked.`)
      .addFields({
        name: 'User',
        value: `${member}`,
        inline: true,
      }, {
        name: 'Actioned by',
        value: `${user}`,
        inline: true,
      }, {
        name: 'Reason',
        value: reason,
      })
      .setTimestamp()
      .setColor('#F7CAC9')

    const msg = await ModActions.notifyUser(member.user, `You were kicked from the \`${guild.name}\` Discord server for the following reason:\n${reason}`).catch(_ => { return undefined })

    member.kick(reason.length > 512 ? `${reason.substring(0, 510)}..` : reason)
      .then(() => {
        ModActions.saveToDb(guild.id, user.id, member.id, ModeratorAction.KICK, reason)
          .then((action) => {
            embed.setTitle(`ID ${action.id} | Kick`)
          })
          .catch(err => {
            logger.error(`Error saving kick to DB\n${err.message}`)
            
            embed.setTitle(`ID *Unknown* | Kick`)
            embed.addFields({
              name: 'Error',
              value: 'Member was kicked, however there was an error saving this data.'
            })
          })
          .finally(() => {
            embed.addFields({
              name: 'Received DM?',
              value: msg ? 'Yes' : 'No'
            })
            if (logChannel && logChannel.type === ChannelType.GuildText) ModActions.notifyGuild(logChannel, embed, (sourceChannel as TextChannel))
          })
      })
      .catch(() => {
        if (msg) msg.delete()
        if (sourceChannel.isTextBased()) (sourceChannel as TextChannel).send(`Unable to kick user <@${member}>.${msg ? ' **User may have seen notification of their kick.**' : ''} Please try again later.`)
      })
  }

  public static ban = async (member: GuildMember, sourceChannel: GuildChannel, reason: string, user: User) => {

    const { guild } = member
    const settings = await ModActions.fetchGuildSettings(guild.id)
    if (!settings) return

    if (!member.bannable) {
      if (sourceChannel.isTextBased()) (sourceChannel as TextChannel).send('Unable to ban user.')
      return
    }

    const { modLogChannelId } = settings
    const logChannel = guild.channels.cache.get(modLogChannelId) || await guild.channels.fetch(modLogChannelId)

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${member.user.username}#${member.user.discriminator} [ID: ${member.user.id}]`, iconURL: member.user.displayAvatarURL() })
      .setDescription(`This user has been banned.`)
      .addFields({
        name: 'User',
        value: `${member}`,
        inline: true,
      }, {
        name: 'Actioned by',
        value: `${user}`,
        inline: true,
      }, {
        name: 'Reason',
        value: reason,
      })
      .setTimestamp()
      .setColor('#FF0000')

    const msg = await ModActions.notifyUser(member.user, `You were banned from the \`${guild.name}\` Discord server for the following reason:\n${reason}`).catch(_ => { return undefined })

    member.ban({
      reason: reason.length > 512 ? `${reason.substring(0, 510)}..` : reason,
      deleteMessageSeconds: 604800
    })
      .then(() => {
        ModActions.saveToDb(guild.id, user.id, member.id, ModeratorAction.BAN, reason)
          .then((action) => {
            embed.setTitle(`ID ${action.id} | Ban`)
          })
          .catch(err => {
            logger.error(`Error saving ban to DB\n${err.message}`)

            embed.setTitle(`ID *Unknown* | Ban`)
            embed.addFields({
              name: 'Error',
              value: 'Member was banned, however there was an error saving this data.'
            })
          })
          .finally(() => {
            embed.addFields({
              name: 'Received DM?',
              value: msg ? 'Yes' : 'No'
            })
            if (logChannel && logChannel.type === ChannelType.GuildText) ModActions.notifyGuild(logChannel, embed, (sourceChannel as TextChannel))
          })
      })
      .catch(() => {
        if (msg) msg.delete()
        if (sourceChannel.isTextBased()) (sourceChannel as TextChannel).send(`Unable to ban user <@${member}>.${msg ? ' **User may have seen notification of their ban.**' : ''} Please try again later.`)
      })
  }

  public static unban = async (member: GuildMember, sourceChannel: GuildChannel, reason: string, user: User) => {

    const settings = await ModActions.fetchGuildSettings(member.guild.id)

  }

  public static loadAllMutes = async (client: Client) => {

    const { items: mutes } = await ModLog.fetchActiveMutes()
    const guildIds = [...new Set(mutes.map(mute => mute.guildId))]
    const guildSettings = new Map<string, GuildSetting>()
    const loads = await Promise.all(guildIds.map(id => GuildSetting.fetchByGuildId(id)))
    loads.forEach(item => {
      if (item) guildSettings.set(item.guildId, item)
    })
    mutes.forEach(async mute => {
      const guild = client.guilds.cache.get(mute.guildId)
      const settings = guildSettings.get(mute.guildId)
      if (!settings || !guild) return
      const { mutedRoleId } = settings
      const member = guild.members.cache.get(mute.targetId) || await guild.members.fetch(mute.targetId).catch(e => logger.debug(e.message))
      const role = guild.roles.cache.get(mutedRoleId) || await guild.roles.fetch(mutedRoleId)
      if (!member || !role) {
        const now = new Date()
        if (mute.muteTime && now > mute.muteTime) mute.unmute().update()
        return
      }
      if (!mute.muteTime) return

      if (!GuildMap.has(guild.id)) {
        const mutedRole = !mutedRoleId ? await ModActions.createMuteRole(guild) : guild.roles.cache.get(mutedRoleId) || await guild.roles.fetch(mutedRoleId)
        if (!mutedRole) return
  
        GuildMap.set(guild.id, { guild, mutedRole, mutes: new Map<string, MuteMapInterface>() })
      }
  
      const instance = GuildMap.get(guild.id)
      if (!instance) return

      const memberInstance = instance.mutes.get(member.id)
      if (memberInstance && memberInstance.endDatetime >= mute.muteTime.getTime()) {
        mute.unmute().update()
      } else if (memberInstance && memberInstance.endDatetime < mute.muteTime.getTime()) memberInstance.data?.unmute().update()
      instance.mutes.set(member.id, { member, data: mute, endDatetime: mute.muteTime.getTime() })
    })

  }

  public static mute = async (member: GuildMember, reason: string, user: User, duration: number, silently: boolean = false, sourceChannel?: GuildChannel) => {

    const endDatetime = Date.now() + duration

    const { guild } = member
    const settings = await ModActions.fetchGuildSettings(guild.id)
    if (!settings) return

    const { mutedRoleId, modLogChannelId } = settings
    const logChannel = guild.channels.cache.get(modLogChannelId) || await guild.channels.fetch(modLogChannelId)

    if (!GuildMap.has(guild.id)) {
      const mutedRole = !mutedRoleId ? await ModActions.createMuteRole(guild) : guild.roles.cache.get(mutedRoleId) || await guild.roles.fetch(mutedRoleId)
      if (!mutedRole) return

      GuildMap.set(guild.id, { guild, mutedRole, mutes: new Map<string, MuteMapInterface>() })
    }

    const instance = GuildMap.get(guild.id)
    if (!instance) return

    const memberInstance = instance.mutes.get(member.id)
    if (memberInstance && memberInstance.endDatetime > endDatetime) {
      if (sourceChannel && sourceChannel.isTextBased()) (sourceChannel as TextChannel).send(`There is already a mute active for this user that lasts longer than the specified duration!`).then(msg => setTimeout(() => msg.delete(), 5000))
      return
    }

    if (!memberInstance) member.roles.add(instance.mutedRole).catch((e) => logger.warn(e))
    if (memberInstance && memberInstance.data) ModActions.dispose(memberInstance.data)

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${member.user.username}#${member.user.discriminator} [ID: ${member.user.id}]`, iconURL: member.user.displayAvatarURL() })
      .setDescription(`This user has been muted.`)
      .addFields({
        name: 'User',
        value: `${member}`,
        inline: true,
      }, {
        name: 'Actioned by',
        value: `${user}`,
        inline: true,
      }, {
        name: 'Reason',
        value: reason,
      })
      .setTimestamp()
      .setColor('#FFA500')

    const memberEmbed = new EmbedBuilder()
      .setTitle('Muted!')
      .setColor('#FFA500')
      .setDescription(`You were muted in the \`${guild.name}\` Discord server!`)
      .addFields({
        name: 'Reason',
        value: reason,
        inline: true
      }, {
        name: 'Duration',
        value: formatDiff(duration),
        inline: true
      })

    const msg = await ModActions.notifyUserEmbed(member.user, memberEmbed).catch(_ => { return undefined })
    embed.addFields({
      name: 'Received DM?',
      value: msg ? 'Yes' : 'No'
    })

    ModActions.saveToDb(guild.id, user.id, member.id, ModeratorAction.MUTE, reason, endDatetime)
      .then((action) => {
        embed.setTitle(`ID ${action.id} | Mute`)
        instance.mutes.set(member.id, { member, data: action, endDatetime })
      })
      .catch(err => {
        logger.error(`Error saving mute to DB\n${err}`)
        
        embed.setTitle(`ID *Unknown* | Mute`)
        embed.addFields({
          name: 'Error',
          value: 'Member was muted, however there was an error saving this data.'
        })
        instance.mutes.set(member.id, { member, data: undefined, endDatetime })
      })
      .finally(() => {
        if (logChannel && logChannel.type === ChannelType.GuildText) {
          if (sourceChannel && sourceChannel.isTextBased()) {
            return ModActions.notifyGuild(logChannel, embed, (sourceChannel as TextChannel))
          }
          ModActions.notifyGuild(logChannel, embed)
        }
      })
  }

  public static unmute = async (member: GuildMember, item?: ModLog, user?: User) => {

    const { guild } = member
    const settings = await ModActions.fetchGuildSettings(guild.id)
    if (!settings) return

    const { mutedRoleId, modLogChannelId } = settings
    const logChannel = guild.channels.cache.get(modLogChannelId) || await guild.channels.fetch(modLogChannelId)
    const mutedRole = guild.roles.cache.get(mutedRoleId) || await guild.roles.fetch(mutedRoleId) || await ModActions.createMuteRole(guild)
    if (!mutedRole) return

    member.roles.remove(mutedRole).catch(e => {
      logger.error(`Unable to remove mutedrole (ID: ${mutedRole.id}) from User ID ${member.id}`)
    })

    if (item) {
      ModActions.dispose(item)
      item.unmute().update().catch(e => logger.warn(`Unable to save unmute to DB\n${e.message}`))
    }

    const msg = await member.send(`Your mute in **${guild.name}** has ended or has been rescinded by a moderator!`).catch(() => {
      logger.warn(`Couldn't DM user ${member.id} regarding unmute in Guild ${guild.id}`)
    })

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${member.user.username}#${member.user.discriminator} [ID: ${member.user.id}]`, iconURL: member.user.displayAvatarURL() })
      .setTitle(`ID ${item?.id || '*Unknown*'} | Unmute`)
      .setDescription(`This user has been unmuted.`)
      .addFields({
        name: 'User',
        value: `${member}`,
        inline: true,
      }, {
        name: 'Actioned by',
        value: user ? `${user}` : 'Auto unmute',
        inline: true,
      }, {
        name: 'Received DM?',
        value: msg ? 'Yes' : 'No',
      })
      .setTimestamp()
      .setColor('#00ff00')

    if (logChannel?.isTextBased()) (logChannel as TextChannel).send({ embeds: [embed] })

  }

  public static dispose = (item: ModLog) => {
    ModLog.fetchById(item.id).then(action => {
      if (!action) return
      action.unmute().update()
    })
  }

  private static notifyGuild = (channel: TextChannel, embed: EmbedBuilder, backup?: TextChannel) => {
    channel.send({ embeds: [embed] })
    if (backup) backup.send({ embeds: [embed] }).then(m => setTimeout(() => m.delete(), 10000))
  }

  private static notifyUser = (user: User, content: string) => {
    return user.send(content)
  }

  private static notifyUserEmbed = (user: User, embed: EmbedBuilder) => {
    return user.send({ embeds: [embed] })
  }

  private static saveToDb = (guildId: string, userId: string, targetId: string, action: ModeratorAction, reason: string, muteTime?: number) => {
    return ModLog.storeNewAction({
      guildId: guildId,
      userId: userId,
      targetId: targetId,
      action,
      reason,
      muteTime: muteTime ? new Date(muteTime) : undefined
    })
  }

  private static fetchGuildSettings = (guildId: string) => {
    return GuildSetting.fetchByGuildId(guildId)
  }

  private static createMuteRole = async (guild: Guild) => {
    // Create a new role
    const newRole = await guild.roles.create({
      name: 'Muted',
      color: Colors.Red,
      permissions: [],
      reason: 'Automated Role Creation'
    })

    await guild.channels.fetch()

    guild.channels.cache.forEach(async channel => {
      newRole && (channel as GuildChannel).permissionOverwrites.create(newRole, {
        SendMessages: false,
        SendMessagesInThreads: false,
        AttachFiles: false,
        AddReactions: false,
        Speak: false
      })
    })

    return GuildSetting.fetchByGuildId(guild.id).then(settings => {
      return settings?.setMutedRole(newRole.id).update().then(() => {
        return newRole
      }).catch(e => {
        const text = `Unable to store mute role settings for Server ID ${guild.id}!`
        logger.error(`${text}\n${e}`)
      })
    }).catch(e => {
      const text = `Unable to store mute role settings for Server ID ${guild.id}!`
      logger.error(`${text}\n${e}`)
    })
  }

}