import { Colors, EmbedBuilder, GuildMember, GuildChannel, ColorResolvable, CommandInteraction } from "discord.js"
import { logger, formatDiff } from './'
import { GuildSetting, ModLog, ModeratorAction } from '../db/models'

const scheduleMap = new Map<string, MemberMap>()

interface ActionArgs {
  user: GuildMember
  target: GuildMember
  reason?: string
  interaction?: CommandInteraction
}

interface TimedActionArgs extends ActionArgs {
  duration?: number
}

interface MemberMap {
  member: GuildMember
  timer: NodeJS.Timeout
}
export abstract class ModAction {

  protected interaction?: CommandInteraction

  protected shortActionText: string = ''
  protected actionText: string = ''
  protected joinText = 'from'
  protected colour: ColorResolvable = '#ffffff'

  protected actionType!: ModeratorAction
  protected user: GuildMember
  protected target: GuildMember
  protected reason: string = 'No reason provided'
  protected duration?: number

  constructor(args: TimedActionArgs) {
    this.interaction = args.interaction
    this.user = args.user
    this.target = args.target
    this.duration = args.duration
    if (args.reason) this.reason = args.reason
  }

  protected execute = (action: Promise<any>, notify: boolean = true) => {

    return new Promise<boolean>(async (resolve, reject) => {

      if (!notify) resolve(false)

      this.notifyUser().then(userMsg => {

        action.then(() => {
          if (this.duration) this.delayedUndo()
          if (this.constructor.name.toLowerCase() === 'unmute' || this.constructor.name.toLowerCase() === 'unban') this.dispose()
          resolve(true)
        }).catch(e => {
          logger.debug(`Unable to ${this.shortActionText} target user. ID: ${this.target.id} | Guild ID ${this.target.guild.id}`)
          userMsg.delete()
          reject(`${this.shortActionText.toUpperCase()}_FAILURE`)
        })

      }).catch(e => {
        logger.debug(`Unable to message target user for ${this.shortActionText}. ID: ${this.target.id} | Guild ID ${this.target.guild.id}`)
        action.then(() => {
          resolve(false)
        }).catch(e => {
          logger.debug(`Unable to ${this.shortActionText} target user. ID: ${this.target.id} | Guild ID ${this.target.guild.id}`)
          reject(`${this.shortActionText.toUpperCase()}_FAILURE`)
        })
      })
    }).then(notified => {
      this.notifyGuild(notified)
      this.store()
    }).catch(e => {
      this.notifyGuild(false, false)
    })

  }

  protected notifyUser = () => {
    const embed = new EmbedBuilder()
      .setTitle(`${this.actionText}!`)
      .setColor(this.colour)
      .setDescription(`You were ${this.actionText} ${this.joinText} the \`${this.target.guild.name}\` Discord server!`)
      .addFields({
        name: 'Reason',
        value: this.reason,
        inline: true
      })

    if (this.duration) embed.addFields({
      name: 'Duration',
      value: formatDiff(this.duration),
      inline: true,
    }, {
      name: 'Approximate end time',
      value: `<t:${(Date.now() + this.duration) / 1000}>`,
      inline: true,
    })

    return this.target.send({ embeds: [embed] })
  }

  protected notifyGuild = async (notified: boolean = true, success: boolean = true) => {

    const { guild } = this.target

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${this.target.user.username} [ID: ${this.target.user.id}]`, iconURL: this.target.user.displayAvatarURL() })
      .setDescription(`This user has been ${this.actionText}.`)
      .addFields({
        name: 'User',
        value: `${this.target}`,
        inline: true,
      }, {
        name: 'Actioned by',
        value: `${this.user}`,
        inline: true,
      }, {
        name: 'Reason',
        value: this.reason,
      }, {
        name: 'Received DM?',
        value: notified ? 'Yes' : 'No'
      })
      .setTimestamp()
      .setColor(this.colour)

    if (this.duration) embed.addFields({
      name: 'Duration',
      value: formatDiff(this.duration),
      inline: true,
    }, {
      name: 'Approximate end time',
      value: `<t:${Math.round((Date.now() + this.duration) / 1000)}>`,
      inline: true,
    })

    GuildSetting.fetchByGuildId(guild.id).then(async settings => {
      if (!settings || !settings.modLogChannelId) return
      const channel = guild.channels.cache.get(settings.modLogChannelId) || await guild.channels.fetch(settings.modLogChannelId)
      if (!channel) return
      if (channel.isTextBased()) channel.send({ embeds: [embed] })
    })

    if (!this.interaction) return

    if (!success) return this.interaction.editReply(`Unable to ${this.shortActionText} user.`)

    this.interaction.editReply({ embeds: [embed] })
  }

  private dispose = () => {
    ModLog.fetchActiveUserMute(this.user.guild.id, this.target.user.id).then(item => item?.unmute().update())
    const key = `${this.target.user.id}-${this.user.guild.id}-${this.constructor.name.toLowerCase().substring(2)}`
    const instance = scheduleMap.get(key)
    if (instance) {
      clearTimeout(instance.timer)
      scheduleMap.delete(key)
    }
  }

  protected store = () => {
    return ModLog.storeNewAction({
      guildId: this.target.guild.id,
      userId: this.user.id,
      targetId: this.target.id,
      action: this.actionType,
      reason: this.reason,
      muteTime: this.duration ? new Date(Date.now() + this.duration) : undefined
    })
  }

  private delayedUndo = async () => {
    if (this.hasExistingEntry()) {
      await ModLog.fetchActiveUserMute(this.user.guild.id, this.target.user.id).then(item => item?.unmute().update())
      const key = `${this.target.user.id}-${this.user.guild.id}-${this.constructor.name.toLowerCase()}`
      const instance = scheduleMap.get(key)
      if (instance) {
        clearTimeout(instance.timer)
        scheduleMap.delete(key)
      }
    }

    scheduleMap.set(`${this.target.user.id}-${this.user.guild.id}-${this.constructor.name.toLowerCase()}`, {
      member: this.target,
      timer: setTimeout(() => {
        const func = this.constructor.name.toLowerCase() === 'ban' ? new Unban({
          user: this.user,
          targetId: this.target.user.id
        })
          : new Unmute({
            user: this.user,
            target: this.target,
          })
        func.action()
      }, this.duration)
    })
  }

  public static delayedAction = (user: GuildMember, target: GuildMember, guildId: string, action: string, duration: number) => {
    scheduleMap.set(`${target.user.id}-${guildId}-${action.toLowerCase()}`, {
      member: target,
      timer: setTimeout(() => {
        const func = this.constructor.name.toLowerCase() === 'ban' ? new Unban({
          user,
          targetId: target.user.id,
        })
          : new Unmute({
            user,
            target: target,
          })
        func.action()
      }, duration)
    })
  }

  private hasExistingEntry = () => {
    return scheduleMap.has(`${this.target.user.id}-${this.user.guild.id}-${this.constructor.name.toLowerCase()}`)
  }

}

export class Ban extends ModAction {

  constructor(args: TimedActionArgs) {
    super(args)
    this.actionText = 'banned'
    this.shortActionText = 'ban'
    this.actionType = ModeratorAction.BAN
    this.colour = Colors.Red
  }

  public action = () => {
    this.execute(this.target.ban())
  }

}

export class Unban extends ModAction {

  constructor(args: Omit<ActionArgs, 'target'> & { targetId: string }) {
    super({
      ...args,
      target: { user: { id: args.targetId } } as GuildMember
    })
    this.actionText = 'unbanned'
    this.shortActionText = 'unban'
    this.actionType = ModeratorAction.UNBAN
    this.colour = Colors.Green
  }

  public action = () => {
    this.execute(this.user.guild.members.unban(this.target.user.id))
  }

}

export class Kick extends ModAction {

  constructor(args: ActionArgs) {
    super(args)
    this.actionText = 'kicked'
    this.shortActionText = 'kick'
    this.actionType = ModeratorAction.KICK
    this.colour = Colors.Fuchsia
  }

  public action = () => {
    this.execute(this.target.kick())
  }

}

export class Warn extends ModAction {

  constructor(args: ActionArgs) {
    super(args)
    this.actionText = 'warned'
    this.shortActionText = 'warn'
    this.joinText = 'in'
    this.actionType = ModeratorAction.WARN
    this.colour = Colors.DarkGold
  }

  private warn = async () => { }

  public action = () => {
    this.execute(this.warn())
  }

}

export class Note extends ModAction {

  constructor(args: ActionArgs) {
    super(args)
    this.actionText = 'made a note on'
    this.shortActionText = 'make a note on'
    this.actionType = ModeratorAction.NOTE
    this.colour = Colors.DarkGold
  }

  private note = async () => { }

  public action = () => {
    this.execute(this.note(), false)
  }

}

export class Mute extends ModAction {

  constructor(args: TimedActionArgs) {
    super(args)
    this.actionText = 'muted'
    this.shortActionText = 'mute'
    this.joinText = 'in'
    this.actionType = ModeratorAction.MUTE
    this.colour = Colors.DarkGold
  }

  private mute = async () => {

    const settings = await this.getSettings()
    if (!settings) return this.interaction?.editReply('Unable to execute at this time.')

    const role = await (settings.mutedRoleId ? this.getMutedRole(settings.mutedRoleId) : this.createMutedRole(settings))
    if (!role) return this.interaction?.editReply('Unable to execute at this time.')

    if (this.duration)

      return this.target.roles.add(role)

  }

  private getSettings = () => {
    return GuildSetting.fetchByGuildId(this.target.guild.id)
  }

  private createMutedRole = async (settings: GuildSetting) => {
    const newRole = await this.target.guild.roles.create({
      name: 'Muted',
      color: Colors.Red,
      permissions: [],
      reason: 'Automated Role Creation'
    })

    await this.target.guild.channels.fetch()

    this.target.guild.channels.cache.forEach(async channel => {
      newRole && (channel as GuildChannel).permissionOverwrites.create(newRole, {
        SendMessages: false,
        SendMessagesInThreads: false,
        AttachFiles: false,
        AddReactions: false,
        Speak: false
      })
    })

    settings.setMutedRole(newRole.id).update()

    return newRole
  }

  private getMutedRole = (roleId: string) => {
    return this.target.guild.roles.fetch(roleId, { cache: true })
  }

  public action = () => {
    this.execute(this.mute())
  }

}

export class Unmute extends ModAction {

  constructor(args: ActionArgs) {
    super(args)
    this.actionText = 'unmuted'
    this.shortActionText = 'unmute'
    this.joinText = 'in'
    this.actionType = ModeratorAction.UNMUTE
    this.colour = Colors.Green
  }

  private unmute = async () => {

    const settings = await this.getSettings()
    if (!settings || !settings.mutedRoleId) return this.interaction?.editReply('Unable to execute at this time.')

    const role = await this.getMutedRole(settings.mutedRoleId)
    if (!role) return this.interaction?.editReply('Unable to execute at this time.')

    return this.target.roles.remove(role)

  }

  private getSettings = () => {
    return GuildSetting.fetchByGuildId(this.target.guild.id)
  }

  private getMutedRole = (roleId: string) => {
    return this.target.guild.roles.fetch(roleId, { cache: true })
  }

  public action = () => {
    this.execute(this.unmute())
  }

}