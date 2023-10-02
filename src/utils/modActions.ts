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

      if (!notify) return resolve(false)

      this.notifyUser().then(userMsg => {

        action.then(() => {
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

  protected notifyUser = async () => {
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

    if (this.constructor.name.toLowerCase() === 'ban') {
      const { guild } = this.target
      const setting = await GuildSetting.fetchByGuildId(guild.id)
      if (setting && setting.appealUrl) {
        embed.addFields({
          name: 'Appeal URL',
          value: `[Ban Appeal Link](${setting.appealUrl})`,
        })
      }
    }

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
    this.execute(this.target.ban({ deleteMessageSeconds: 604800, reason: this.reason }))
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
    this.execute(this.target.kick(this.reason))
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

  public action = () => {
    this.execute(this.target.timeout(this.duration || 0, this.reason))
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

  public action = () => {
    this.execute(this.target.timeout(null, this.reason))
  }

}