import { Colors, EmbedBuilder, GuildMember, GuildChannel, ColorResolvable, CommandInteraction } from "discord.js"
import { logger, formatDiff } from './'
import { GuildSetting, ModLog, ModeratorAction } from '../db/models'

abstract class ModAction {

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

  constructor(user: GuildMember, target: GuildMember, reason?: string, interaction?: CommandInteraction) {
    this.interaction = interaction
    this.user = user
    this.target = target
  }

  protected execute = (action: Promise<any>) => {

    return new Promise<boolean>((resolve, reject) => {

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
      inline: true
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

    GuildSetting.fetchByGuildId(guild.id).then(async settings => {
      if (!settings || !settings.memberLogChannelId) return
      const channel = guild.channels.cache.get(settings.memberLogChannelId) || await guild.channels.fetch(settings.memberLogChannelId)
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

  constructor(user: GuildMember, target: GuildMember, reason?: string, interaction?: CommandInteraction) {
    super(user, target, reason, interaction)
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

  constructor(user: GuildMember, targetId: string, reason?: string, interaction?: CommandInteraction) {
    super(user, ({ user: { id: targetId } } as GuildMember), reason, interaction)
    this.actionText = 'unbanned'
    this.shortActionText = 'unban'
    this.actionType = ModeratorAction.UNBAN
    this.colour = Colors.Green
  }

  public action = () => {
    this.execute(this.target.guild.members.unban(this.target.user.id))
  }

}

export class Kick extends ModAction {

  constructor(user: GuildMember, target: GuildMember, reason?: string, interaction?: CommandInteraction) {
    super(user, target, reason, interaction)
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

  constructor(user: GuildMember, target: GuildMember, reason?: string, interaction?: CommandInteraction) {
    super(user, target, reason, interaction)
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

export class Mute extends ModAction {

  constructor(user: GuildMember, target: GuildMember, reason?: string, interaction?: CommandInteraction) {
    super(user, target, reason, interaction)
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

  constructor(user: GuildMember, target: GuildMember, reason?: string, interaction?: CommandInteraction) {
    super(user, target, reason, interaction)
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